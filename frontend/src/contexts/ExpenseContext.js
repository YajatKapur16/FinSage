import React, { createContext, useContext, useState, useEffect } from 'react';
import apiInstance from '../services/apiService';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const { currentUser, initialized } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      if (!currentUser || !initialized) return;
      
      try {
        const response = await apiInstance.get('/expense/categories');
        if (mounted) {
          setCategories(response.data);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to fetch categories');
          console.error('Error fetching categories:', err);
        }
      }
    };

    initializeData();

    return () => {
      mounted = false;
    };
  }, [currentUser, initialized]);

  const fetchExpenses = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const response = await apiInstance.get('/expense', {
        params: {
          skip: page * rowsPerPage,
          limit: rowsPerPage
        }
      });
      setExpenses(response.data.items);
      setTotalExpenses(response.data.total);
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch expenses when page or rowsPerPage changes
  useEffect(() => {
    if (currentUser && initialized) {
      fetchExpenses();
    }
  }, [page, rowsPerPage, currentUser, initialized]);

  const createExpense = async (data) => {
    if (!currentUser) return;
    
    try {
      const response = await apiInstance.post('/expense', data);
      await fetchExpenses();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create expense';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateExpense = async (id, data) => {
    if (!currentUser) return;
    
    try {
      const response = await apiInstance.put(`/expense/${id}`, data);
      await fetchExpenses();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update expense';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteExpense = async (id) => {
    if (!currentUser) return;
    
    try {
      await apiInstance.delete(`/expense/${id}`);
      await fetchExpenses();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete expense';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    expenses,
    categories,
    loading,
    error,
    totalExpenses,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export default ExpenseContext;