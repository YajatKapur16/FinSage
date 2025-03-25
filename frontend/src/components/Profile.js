import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Avatar,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

const Profile = () => {
  const { currentUser, initialized } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing, revert changes
      if (currentUser) {
        setProfileData({
          first_name: currentUser.first_name || '',
          last_name: currentUser.last_name || '',
          email: currentUser.email || '',
          phone_number: currentUser.phone_number || '',
        });
      }
    }
    setEditing(!editing);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // This is a placeholder - you would implement the actual profile update API call
      // const response = await authService.updateProfile(profileData);
      
      // For now, just simulate a successful update
      setTimeout(() => {
        setSuccess('Profile updated successfully!');
        setEditing(false);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      py: 4, 
      px: 2,
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(180deg, #121212 0%, #1E1E1E 100%)'
    }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: 'white' }}>
          Your Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              p: 3, 
              bgcolor: 'rgba(255,255,255,0.03)', 
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {currentUser?.first_name ? currentUser.first_name[0] : ''}
                {currentUser?.last_name ? currentUser.last_name[0] : ''}
              </Avatar>

              <Typography variant="h5" sx={{ mb: 1 }}>
                {currentUser?.first_name} {currentUser?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentUser?.email}
              </Typography>

              <Button 
                variant={editing ? "outlined" : "contained"} 
                startIcon={editing ? <CancelIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                sx={{
                  mt: 'auto',
                  bgcolor: editing ? 'transparent' : 'primary.main',
                  borderColor: editing ? 'error.main' : 'primary.main',
                  color: editing ? 'error.main' : 'white',
                  '&:hover': { 
                    bgcolor: editing ? 'error.main' : 'primary.dark',
                    color: 'white' 
                  }
                }}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              p: 3, 
              bgcolor: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 2
            }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Personal Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleChange}
                      disabled={!editing}
                      variant="filled"
                      sx={{ 
                        mb: 2,
                        '& .MuiFilledInput-root': { 
                          bgcolor: 'rgba(255,255,255,0.05)'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleChange}
                      disabled={!editing}
                      variant="filled"
                      sx={{ 
                        mb: 2,
                        '& .MuiFilledInput-root': { 
                          bgcolor: 'rgba(255,255,255,0.05)'
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={true} // Email typically shouldn't be editable
                  variant="filled"
                  sx={{ 
                    mb: 3,
                    '& .MuiFilledInput-root': { 
                      bgcolor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={profileData.phone_number}
                  onChange={handleChange}
                  disabled={!editing}
                  variant="filled"
                  sx={{ 
                    mb: 3,
                    '& .MuiFilledInput-root': { 
                      bgcolor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                />

                {editing && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                      sx={{
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />

              <Typography variant="h6" sx={{ mb: 3 }}>
                Account Security
              </Typography>

              <Button
                variant="outlined"
                sx={{
                  mb: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': { 
                    borderColor: 'primary.dark',
                    bgcolor: 'rgba(255,107,0,0.05)'
                  }
                }}
              >
                Change Password
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;