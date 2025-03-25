import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LoginSignup = () => {
  const navigate = useNavigate();
  const { login, register, error: authError, currentUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!isLogin) {
      if (!formData.first_name) {
        errors.first_name = 'First name is required';
      }
      if (!formData.last_name) {
        errors.last_name = 'Last name is required';
      }
      if (formData.phone_number && !/^\+?[\d\s-]{10,}$/.test(formData.phone_number)) {
        errors.phone_number = 'Please enter a valid phone number';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password
        });
        navigate('/dashboard');
      } else {
        // Registration flow
        await register({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number
        });
        // Show success message and switch to login form
        setError('');
        setSuccess('Registration successful! Please log in.');
        setIsLogin(true);
        // Clear form data
        setFormData({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          phone_number: ''
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Use the error message from the backend if available
      setError(err.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(255,107,0,0.2)',
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 700,
                background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Typography>

            {success && (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                {success}
              </Alert>
            )}

            {(error || authError) && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error || authError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255,107,0,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,107,0,0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B00',
                    },
                  },
                }}
              />

              {!isLogin && (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    error={!!validationErrors.first_name}
                    helperText={validationErrors.first_name}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(255,107,0,0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,107,0,0.4)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF6B00',
                        },
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    error={!!validationErrors.last_name}
                    helperText={validationErrors.last_name}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(255,107,0,0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,107,0,0.4)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF6B00',
                        },
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    error={!!validationErrors.phone_number}
                    helperText={validationErrors.phone_number}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(255,107,0,0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,107,0,0.4)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF6B00',
                        },
                      },
                    }}
                  />
                </>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,107,0,0.7)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255,107,0,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,107,0,0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B00',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  bgcolor: '#FF6B00',
                  '&:hover': {
                    bgcolor: '#FF8C00',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(255,107,0,0.3)',
                  },
                  position: 'relative'
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setValidationErrors({});
                  }}
                  sx={{
                    color: '#FF6B00',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Sign In'}
                </Link>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginSignup;