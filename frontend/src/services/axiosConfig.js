import axios from 'axios';
import authService from './authService';

// Set base URL for all requests
axios.defaults.baseURL = 'http://localhost:8000';

// Add request interceptor to add authentication token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await authService.refreshToken();
      const token = localStorage.getItem('accessToken');
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axios(originalRequest);
    } catch (refreshError) {
      // If refresh token is invalid, logout user
      authService.logout();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);