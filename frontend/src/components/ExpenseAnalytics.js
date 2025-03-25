import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#FF6B00', '#FF8C00', '#FFA500', '#FFB347', '#FFCB73', '#FFD39B', '#FFE4B5', '#FFF0D9'];

function ExpenseAnalytics({ type = 'monthly' }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/expense/analytics/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!analyticsData) return [];
    
    if (type === 'categories') {
      // Prepare data for category breakdown
      return Object.entries(analyticsData.category_distribution).map(([category, amount]) => ({
        name: category,
        value: parseFloat(amount)
      }));
    } else {
      // Prepare data for monthly spending
      return Object.entries(analyticsData.monthly_spending).map(([month, amount]) => ({
        name: month,
        amount: parseFloat(amount)
      })).sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!analyticsData) {
    return <Typography color="text.secondary">No analytics data available</Typography>;
  }

  const chartData = prepareChartData();

  if (chartData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="text.secondary">No expense data available for analytics</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {type === 'categories' ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <Typography variant="subtitle2" sx={{ textAlign: 'center', mt: 1 }}>
            Total: ${analyticsData.total_expenses.toFixed(2)}
          </Typography>
        </>
      ) : (
        <ResponsiveContainer width="50%" height={250}>
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Bar dataKey="amount" name="Amount" fill="#FF6B00" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}

export default ExpenseAnalytics;