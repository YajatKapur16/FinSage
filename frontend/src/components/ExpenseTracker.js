import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  CircularProgress,
  TablePagination,
  Alert,
  Chip,
  Stack,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { format } from 'date-fns';
import expenseService from '../services/expenseService';

const steps = ['Enter Description', 'Review Prediction', 'Confirm Details'];

function ExpenseTracker({ preview = false, limit = 10 }) {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(limit);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  // Expense Creation Flow
  const [activeStep, setActiveStep] = useState(0);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    category_id: ''
  });

  // Fetch expenses and categories when component mounts
  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [page, rowsPerPage, preview]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If in preview mode, get only the latest expenses
      const limit = preview ? 5 : rowsPerPage;
      const skip = preview ? 0 : page * rowsPerPage;
      
      const response = await expenseService.getExpenses({
        page: page + 1,
        limit,
        skip
      });
      
      setExpenses(response.items);
      if (!preview) {
        setTotalExpenses(response.total);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to fetch expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await expenseService.getCategories();
      setCategories(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load expense categories. Please try again.');
    }
  };

  const handleOpenExpenseDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseFormData({
        description: expense.description,
        amount: expense.amount,
        category_id: expense.category_id
      });
      setActiveStep(2); // Skip prediction for editing
    } else {
      setEditingExpense(null);
      setExpenseFormData({
        description: '',
        amount: '',
        category_id: ''
      });
      setPrediction(null);
      setActiveStep(0);
    }
    setOpenExpenseDialog(true);
  };

  const handleCloseExpenseDialog = () => {
    setOpenExpenseDialog(false);
    setActiveStep(0);
    setPrediction(null);
    setExpenseFormData({
      description: '',
      amount: '',
      category_id: ''
    });
  };

  const handleOpenDeleteDialog = (expense) => {
    setEditingExpense(expense);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleExpenseFormChange = (e) => {
    const { name, value } = e.target;
    setExpenseFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || value : value
    }));
  };

  const handleProcessExpense = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await expenseService.processExpense({
        description: expenseFormData.description
      });
      setPrediction(result);
      setExpenseFormData(prev => ({
        ...prev,
        amount: result.predicted_amount,
        category_id: result.predicted_category_id
      }));
      setActiveStep(1);
    } catch (err) {
      console.error('Error processing expense:', err);
      setError('Failed to process expense. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExpense = async () => {
    try {
      setLoading(true);
      setError(null);
      await expenseService.confirmExpense({
        description: expenseFormData.description,
        amount: expenseFormData.amount,
        category_id: expenseFormData.category_id
      });
      handleCloseExpenseDialog();
      fetchExpenses();
    } catch (err) {
      console.error('Error confirming expense:', err);
      setError('Failed to confirm expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpense = async () => {
    try {
      setLoading(true);
      setError(null);
      await expenseService.updateExpense(editingExpense.id, expenseFormData);
      handleCloseExpenseDialog();
      fetchExpenses();
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    try {
      setLoading(true);
      setError(null);
      await expenseService.deleteExpense(editingExpense.id);
      handleCloseDeleteDialog();
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      handleProcessExpense();
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (editingExpense) {
        handleUpdateExpense();
      } else {
        handleConfirmExpense();
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  if (loading && !preview) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Dialog content based on step
  const getDialogContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={expenseFormData.description}
              onChange={handleExpenseFormChange}
              margin="normal"
              variant="outlined"
              required
              multiline
              rows={2}
              placeholder="Enter expense description (e.g., 'Paid $45.99 for groceries at Walmart')"
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Predicted Expense Details:
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Description:</strong> {prediction.description}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Predicted Amount:</strong> ${prediction.predicted_amount.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <strong>Predicted Category:</strong> {prediction.predicted_category_name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Please review the prediction. You can modify these details in the next step if needed.
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={expenseFormData.description}
              onChange={handleExpenseFormChange}
              margin="normal"
              variant="outlined"
              required
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={expenseFormData.amount}
              onChange={handleExpenseFormChange}
              margin="normal"
              variant="outlined"
              required
              inputProps={{ step: "0.01", min: "0" }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category_id"
                value={expenseFormData.category_id}
                onChange={handleExpenseFormChange}
                label="Category"
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Card sx={{ 
      bgcolor: preview ? 'transparent' : 'background.paper',
      boxShadow: preview ? 0 : 1,
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {!preview && (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Expense Management
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenExpenseDialog()}
          >
            Add Expense
          </Button>
        </Box>
      )}

      {error && !preview && (
        <Alert severity="error" sx={{ mx: 3, mb: 3 }}>{error}</Alert>
      )}

      {expenses.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No expenses found</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table sx={{ minWidth: 650 }} size={preview ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                {!preview && <TableCell>Date</TableCell>}
                {!preview && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell component="th" scope="row">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={expense.category?.name || 'Unknown'} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,107,0,0.1)', 
                        color: 'primary.main',
                        fontSize: '0.75rem'
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${expense.amount.toFixed(2)}
                  </TableCell>
                  {!preview && (
                    <TableCell>
                      {format(new Date(expense.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  )}
                  {!preview && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenExpenseDialog(expense)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog(expense)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!preview && !loading && expenses.length > 0 && (
        <Box sx={{ p: 2 }}>
          <TablePagination
            component="div"
            count={totalExpenses}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      )}

      {/* Add/Edit Expense Dialog */}
      <Dialog 
        open={openExpenseDialog} 
        onClose={handleCloseExpenseDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          {!editingExpense && (
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}
          {getDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExpenseDialog} color="inherit">
            Cancel
          </Button>
          {activeStep > 0 && !editingExpense && (
            <Button onClick={handleBack} color="inherit">
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            variant="contained"
            disabled={!expenseFormData.description}
          >
            {activeStep === steps.length - 1 ? (editingExpense ? 'Update' : 'Confirm') : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this expense?
          </Typography>
          {editingExpense && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Description:</strong> {editingExpense.description}
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> ${editingExpense.amount.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <strong>Category:</strong> {editingExpense.category?.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteExpense} 
            variant="contained" 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default ExpenseTracker;