import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useExpense } from '../../contexts/ExpenseContext';

const ExpenseForm = ({ onClose, initialData = null }) => {
  const { categories, createExpense, updateExpense } = useExpense();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    category_id: initialData?.category_id || '',
    date: initialData?.date || new Date()
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!formData.category_id) {
      setError('Please select a category');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const expenseData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
      };

      if (initialData?.id) {
        await updateExpense(initialData.id, expenseData);
      } else {
        await createExpense(expenseData);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Amount"
        name="amount"
        type="number"
        value={formData.amount}
        onChange={handleChange}
        required
        InputProps={{
          startAdornment: <Typography>₹</Typography>
        }}
        inputProps={{ step: "0.01", min: "0" }}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DatePicker
        label="Date"
        value={formData.date}
        onChange={handleDateChange}
        slotProps={{
          textField: {
            fullWidth: true,
            sx: { mb: 2 }
          }
        }}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            initialData ? 'Update' : 'Create'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ExpenseForm;