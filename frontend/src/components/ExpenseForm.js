import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import expenseService from '../services/expenseService';

function ExpenseForm({ onSubmitSuccess }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  // Load categories when component mounts
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await expenseService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load expense categories. Please try again.');
      }
    };
    fetchCategories();
  }, []);

  const handleProcess = useCallback(async () => {
    if (!description.trim()) {
      setError('Please enter an expense description');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await expenseService.processExpense({ description });
      setPrediction(result);
      setAmount(result.predicted_amount.toString());
      setSelectedCategoryId(result.predicted_category_id.toString());
      setConfirmDialogOpen(true);
    } catch (err) {
      console.error('Error processing expense:', err);
      setError(err.message || 'Failed to process expense. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [description]);

  const handleConfirm = useCallback(async () => {
    if (!amount || !selectedCategoryId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const expenseData = {
        description,
        amount: parseFloat(amount),
        category_id: parseInt(selectedCategoryId, 10)
      };

      await expenseService.confirmExpense(expenseData);
      setDescription('');
      setAmount('');
      setSelectedCategoryId('');
      setPrediction(null);
      setConfirmDialogOpen(false);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      console.error('Error confirming expense:', err);
      setError(err.message || 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [description, amount, selectedCategoryId, onSubmitSuccess]);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Expense
      </Typography>

      <Box component="form" noValidate sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Expense Description"
          placeholder="Enter your expense (e.g., Paid $45.99 for groceries at Walmart)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          margin="normal"
          multiline
          rows={2}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleProcess}
          disabled={loading || !description.trim()}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Process Expense'}
        </Button>
      </Box>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Review and confirm the expense details:
            </Typography>

            <TextField
              fullWidth
              label="Description"
              value={description}
              disabled
              margin="normal"
            />

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: <Typography>$</Typography>
              }}
            />

            <TextField
              fullWidth
              select
              label="Category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              margin="normal"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirm}
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm & Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default ExpenseForm;