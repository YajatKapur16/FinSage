import api from './api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  async login(credentials) {
    try {
      // Use axios directly to avoid interceptors
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        
        // Get user profile after successful login
        const userProfile = await this.getUserProfile();
        localStorage.setItem('user', JSON.stringify(userProfile));
        
        return {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          user: userProfile
        };
      }
      throw new Error('No token received');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Use axios directly to avoid interceptors
      const response = await axios.post(`${API_URL}/auth/refresh`, null, {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      });

      if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token);
        }
        return response.data;
      }
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message);
      this.logout();
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Clear any cached API headers
    delete api.defaults.headers.common['Authorization'];
  }

  async getUserProfile() {
    try {
      const response = await api.get('/auth/users/me');
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error.response?.data || error.message);
      throw error;
    }
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  getAuthHeader() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default new AuthService();