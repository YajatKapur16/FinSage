import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TablePagination,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useExpense } from '../contexts/ExpenseContext';
import ExpenseForm from './ExpenseForm';

const ExpenseManager = () => {
  const {
    expenses,
    loading,
    error,
    totalExpenses,
    page,
    rowsPerPage,
    fetchExpenses,
    deleteExpense,
    setPage,
    setRowsPerPage
  } = useExpense();

  const [openForm, setOpenForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenForm = (expense = null) => {
    setSelectedExpense(expense);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelectedExpense(null);
    setOpenForm(false);
  };

  const handleDelete = async (id) => {
    try {
      setDeleteError('');
      await deleteExpense(id);
    } catch (error) {
      setDeleteError('Failed to delete expense');
    }
  };

  const handleSubmit = (expenseData) => {
    fetchExpenses(); // Refresh the list after submission
    handleCloseForm();
  };

  if (loading && !expenses.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: '#FF6B00' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Expense Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{
            bgcolor: '#FF6B00',
            '&:hover': { bgcolor: '#FF8C00' }
          }}
        >
          Add Expense
        </Button>
      </Box>

      {(error || deleteError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || deleteError}
        </Alert>
      )}

      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          width: '100%',
          mb: 3,
          overflow: 'hidden',
          bgcolor: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,107,0,0.2)',
          borderRadius: 2
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No expenses found. Add your first expense!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      component={motion.tr}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.category.name}</TableCell>
                      <TableCell align="right">
                        ${expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(expense.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenForm(expense)}
                          sx={{ color: '#FF6B00' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(expense.id)}
                          sx={{ color: '#FF6B00' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalExpenses}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <ExpenseForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
    </Container>
  );
};

export default ExpenseManager;