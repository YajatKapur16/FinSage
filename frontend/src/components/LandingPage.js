import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Forum,
  Analytics,
  Psychology,
  KeyboardArrowDown
} from '@mui/icons-material';
import PublicNavbar from './PublicNavbar';
import ChatbotSection from './ChatbotSection';
import Testimonials from './Testimonials';
import Footer from './Footer';
import ContactForm from './ContactForm';
import { scrollToSection } from '../utils/scrollToSection';

const FeatureCard = ({ icon, title, description, index }) => (
  <Card
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    sx={{
      height: '100%',
      bgcolor: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(10px)',
      borderRadius: 4,
      border: '1px solid',
      borderColor: 'rgba(255,107,0,0.2)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
        opacity: 0,
        transition: 'opacity 0.2s',
      },
      '&:hover::before': {
        opacity: 1,
      }
    }}
  >
    <CardContent sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {React.cloneElement(icon, {
          sx: { 
            fontSize: 40,
            color: '#FF6B00',
            filter: 'drop-shadow(0 0 8px rgba(255,107,0,0.3))'
          }
        })}
        <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <TrendingUp />,
      title: 'Smart Tracking',
      description: 'Track your expenses effortlessly with our intuitive interface and intelligent categorization system.'
    },
    {
      icon: <Analytics />,
      title: 'AI Analytics',
      description: 'Get personalized insights and detailed analysis of your spending patterns powered by AI.'
    },
    {
      icon: <Forum />,
      title: 'Community Forum',
      description: 'Connect with like-minded individuals, share financial tips, and learn from the community.'
    },
    {
      icon: <Psychology />,
      title: 'Predictive Insights',
      description: 'Let AI help you forecast future expenses and make smarter financial decisions.'
    }
  ];

  return (
    <>
      <PublicNavbar />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(255,107,0,0.1) 0%, rgba(255,107,0,0) 70%)',
            zIndex: 0,
          },
        }}
      >
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant={isSmallScreen ? 'h3' : 'h2'}
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 20px rgba(255,107,0,0.3)',
                    lineHeight: 1.2,
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  Smart Finance Management with AI Assistant
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    maxWidth: '90%',
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  Take control of your finances with FinSage's intelligent expense tracking and AI-powered predictions.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 6 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/auth')}
                    sx={{
                      bgcolor: '#FF6B00',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: '#FF8C00',
                      }
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => scrollToSection('features')}
                    sx={{
                      borderColor: '#FF6B00',
                      color: '#FF6B00',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: '#FF8C00',
                        bgcolor: 'rgba(255,107,0,0.05)'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -40,
                      left: -40,
                      right: -40,
                      bottom: -40,
                      background: 'radial-gradient(circle, rgba(255,107,0,0.1) 0%, rgba(255,107,0,0) 70%)',
                      borderRadius: '50%',
                      animation: 'pulse 3s infinite'
                    },
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(0.95)',
                        opacity: 0.5
                      },
                      '50%': {
                        transform: 'scale(1)',
                        opacity: 0.8
                      },
                      '100%': {
                        transform: 'scale(0.95)',
                        opacity: 0.5
                      }
                    }
                  }}
                >
                  <Box
                    component="img"
                    src="/hero-image.png"
                    alt="Finance Management"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: 600,
                      display: 'block',
                      margin: 'auto',
                      position: 'relative',
                      zIndex: 1
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* Features Section */}
        <Box
          id="features"
          sx={{
            py: { xs: 8, md: 12 },
            background: 'linear-gradient(180deg, #1E1E1E 0%, #121212 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle, rgba(255,107,0,0.1) 0%, rgba(255,107,0,0) 70%)',
              zIndex: 0,
            },
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h3"
                align="center"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Key Features
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
              >
                Discover the powerful features that make FinSage your ultimate financial companion
              </Typography>
            </motion.div>

            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FeatureCard {...feature} index={index} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box id="chatbot">
          <ChatbotSection />
        </Box>
        <Box id="testimonials">
          <Testimonials />
        </Box>
        <Box id="contact">
          <ContactForm />
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default LandingPage;