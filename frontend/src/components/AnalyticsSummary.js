import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import expenseService from '../services/expenseService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

function AnalyticsSummary({ preview = false }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const preparePieChartData = () => {
    if (!analytics?.category_distribution) return [];
    return Object.entries(analytics.category_distribution).map(([name, value]) => ({
      name,
      value
    }));
  };

  const prepareLineChartData = () => {
    if (!analytics?.monthly_spending) return [];
    return Object.entries(analytics.monthly_spending).map(([month, amount]) => ({
      month,
      amount
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <Card sx={{ 
      bgcolor: preview ? 'transparent' : 'background.paper',
      boxShadow: preview ? 0 : 1,
      borderRadius: 2
    }}>
      {!preview && (
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Expense Analytics
          </Typography>
        </Box>
      )}
      
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                    {formatCurrency(analytics.total_expenses)}
                  </Typography>
                </CardContent>
              </Card>
              
              {/* Monthly Comparison */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Monthly Overview
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={prepareLineChartData()}
                        margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)}
                          labelStyle={{ color: 'black' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Expense Distribution by Category
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePieChartData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={preview ? 80 : 120}
                        label={({ name, percent }) => 
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {preparePieChartData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        labelStyle={{ color: 'black' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default AnalyticsSummary;