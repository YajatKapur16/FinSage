import api from './api';
import authService from './authService';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleApiError = async (error, retryCount = 0) => {
  if (error.response?.status === 401 && retryCount < MAX_RETRIES) {
    try {
      await authService.refreshToken();
      return { shouldRetry: true };
    } catch (refreshError) {
      authService.logout();
      throw new Error('Authentication expired. Please login again.');
    }
  }

  let errorMessage = error.response?.data?.detail || error.message;
  if (error.response?.status === 404) {
    errorMessage = 'Resource not found.';
  } else if (error.response?.status === 403) {
    errorMessage = 'You do not have permission to perform this action.';
  } else if (error.response?.status === 400) {
    errorMessage = error.response.data?.detail || 'Invalid request. Please check your input.';
  }

  console.error('Expense API Error:', errorMessage, error);
  throw new Error(errorMessage);
};

const expenseService = {
  getCategories: async () => {
    let retryCount = 0;
    while (true) {
      try {
        console.log('Fetching expense categories');
        const response = await api.get('/expense/categories');
        console.log('Successfully fetched categories:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        const result = await handleApiError(error, retryCount);
        if (result?.shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying categories fetch (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw error;
      }
    }
  },

  processExpense: async (expenseData) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log('Processing expense:', expenseData);
        const response = await api.post('/expense/process', expenseData);
        console.log('Successfully processed expense:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error processing expense:', error);
        const result = await handleApiError(error, retryCount);
        if (result?.shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying expense processing (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw error;
      }
    }
  },

  confirmExpense: async (expenseData) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log('Confirming expense:', expenseData);
        const response = await api.post('/expense/confirm', {
          ...expenseData,
          confirmed: true
        });
        console.log('Successfully confirmed expense:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error confirming expense:', error);
        const result = await handleApiError(error, retryCount);
        if (result?.shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying expense confirmation (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw error;
      }
    }
  },

  getExpenses: async (params = {}) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log('Fetching expenses with params:', params);
        const { page = 1, limit = 10, skip = 0, category_id, start_date, end_date } = params;
        
        const queryParams = new URLSearchParams({
          limit: limit.toString(),
          skip: skip.toString()
        });

        if (category_id) queryParams.append('category_id', category_id.toString());
        if (start_date) queryParams.append('start_date', start_date);
        if (end_date) queryParams.append('end_date', end_date);

        const response = await api.get(`/expense/?${queryParams}`);
        console.log('Successfully fetched expenses:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching expenses:', error);
        const result = await handleApiError(error, retryCount);
        if (result?.shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying expenses fetch (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw error;
      }
    }
  },

  getExpense: async (id) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log(`Fetching expense ${id}`);
        const response = await api.get(`/expense/${id}`);
        console.log('Successfully fetched expense:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Error fetching expense ${id}:`, error);
        const result = await handleApiError(error, retryCount);
        if (result?.shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying expense fetch (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw error;
      }
    }
  },

  updateExpense: async (id, expenseData) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log(`Updating expense ${id}:`, expenseData);
        const response = await api.put(`/expense/${id}`, expenseData);
        console.log('Successfully updated expense:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Error updating expense ${id}:`, error);
        const result = await handleApiError(error, retryCount);
        if (result?.shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying expense update (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw error;
      }
    }
  },

  deleteExpense: async (id) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log(`Deleting expense ${id}`);
        await api.delete(`/expense/${id}`);
        console.log('Successfully deleted expense');
        return true;
      } catch (error) {
        console.error(`Error deleting expense ${id}:`, error);
        const result = await handleApiError(error, retryCount);
        if (result?.shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying expense deletion (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw error;
      }
    }
  },

  getAnalytics: async (params = {}) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log('Fetching expense analytics with params:', params);
        const { start_date, end_date } = params;
        
        const queryParams = new URLSearchParams();
        if (start_date) queryParams.append('start_date', start_date);
        if (end_date) queryParams.append('end_date', end_date);

        const response = await api.get(`/expense/analytics/summary?${queryParams}`);
        console.log('Successfully fetched analytics:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        const result = await handleApiError(error, retryCount);
        if (result?.shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying analytics fetch (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw error;
      }
    }
  }
};

export default expenseService;