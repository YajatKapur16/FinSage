import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  Alert,
  Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import { SendRounded, LocationOnRounded, PhoneRounded, EmailRounded } from '@mui/icons-material';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement API call
      setSnackbar({
        open: true,
        message: 'Message sent successfully!',
        severity: 'success'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const contactInfo = [
    {
      icon: <LocationOnRounded />,
      title: 'Visit Us',
      details: '123 FinSage Street, Colombo 07, Sri Lanka'
    },
    {
      icon: <PhoneRounded />,
      title: 'Call Us',
      details: '+94 11 234 5678'
    },
    {
      icon: <EmailRounded />,
      title: 'Email Us',
      details: 'contact@finsage.com'
    }
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #121212 0%, #1E1E1E 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,107,0,0.1) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Contact Information */}
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Get in Touch
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 6, maxWidth: '400px' }}
              >
                Have questions about FinSage? We're here to help. Send us a message and we'll respond as soon as possible.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,107,0,0.1)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          {info.title}
                        </Typography>
                        <Typography color="text.secondary">
                          {info.details}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  p: 4,
                  bgcolor: 'background.paper',
                  borderRadius: 4,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                  border: '1px solid',
                  borderColor: 'rgba(255,107,0,0.2)',
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="filled"
                      sx={{
                        '& .MuiFilledInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.08)',
                          },
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="filled"
                      sx={{
                        '& .MuiFilledInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.08)',
                          },
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      variant="filled"
                      sx={{
                        '& .MuiFilledInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.08)',
                          },
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      variant="filled"
                      sx={{
                        '& .MuiFilledInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.08)',
                          },
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      endIcon={<SendRounded />}
                      fullWidth
                      sx={{
                        py: 1.5,
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ContactForm;