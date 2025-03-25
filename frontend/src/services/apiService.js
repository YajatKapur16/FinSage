import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle errors
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResult = await authService.refreshToken();
        if (refreshResult && refreshResult.access_token) {
          localStorage.setItem('accessToken', refreshResult.access_token);
          if (refreshResult.refresh_token) {
            localStorage.setItem('refreshToken', refreshResult.refresh_token);
          }
          apiInstance.defaults.headers.common['Authorization'] = `Bearer ${refreshResult.access_token}`;
          originalRequest.headers.Authorization = `Bearer ${refreshResult.access_token}`;
          processQueue(null, refreshResult.access_token);
          return apiInstance(originalRequest);
        } else {
          processQueue(new Error('Failed to refresh token'));
          authService.logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        authService.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiInstance;