import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken && !refreshToken) {
          throw new Error('No tokens found');
        }

        // Try to get user profile with existing token
        try {
          const profile = await authService.getUserProfile();
          if (mounted) {
            setCurrentUser(profile);
          }
        } catch (profileError) {
          // If token is expired, try to refresh
          if (profileError.response?.status === 401 && refreshToken) {
            try {
              await authService.refreshToken();
              const profile = await authService.getUserProfile();
              if (mounted) {
                setCurrentUser(profile);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              authService.logout();
              if (mounted) {
                setCurrentUser(null);
              }
            }
          } else {
            throw profileError;
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        authService.logout();
        if (mounted) {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    try {
      setError('');
      const data = await authService.login(credentials);
      const profile = await authService.getUserProfile();
      setCurrentUser(profile);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError('');
      setLoading(true);
      const response = await authService.register(userData);
      // Don't automatically log in after registration
      // This makes the flow more explicit and secure
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    initialized,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;