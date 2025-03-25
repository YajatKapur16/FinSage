import React from 'react';
import { Container, Typography, Grid, Box, Card } from '@mui/material';
import { motion } from 'framer-motion';
import {
  AutoGraphRounded,
  NotificationsActiveRounded,
  SecurityRounded,
  TrendingUpRounded,
  AccountBalanceWalletRounded,
  InsightsRounded
} from '@mui/icons-material';

const features = [
  {
    icon: <AutoGraphRounded sx={{ fontSize: 40 }} />,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms analyze your spending patterns and provide personalized insights.'
  },
  {
    icon: <NotificationsActiveRounded sx={{ fontSize: 40 }} />,
    title: 'Smart Alerts',
    description: 'Get real-time notifications for unusual spending, bill payments, and budget limits.'
  },
  {
    icon: <SecurityRounded sx={{ fontSize: 40 }} />,
    title: 'Bank-Level Security',
    description: 'Your financial data is protected with enterprise-grade encryption and security measures.'
  },
  {
    icon: <TrendingUpRounded sx={{ fontSize: 40 }} />,
    title: 'Expense Tracking',
    description: 'Automatically categorize and track your expenses with high accuracy.'
  },
  {
    icon: <AccountBalanceWalletRounded sx={{ fontSize: 40 }} />,
    title: 'Budget Management',
    description: 'Create and manage custom budgets with flexible categories and spending limits.'
  },
  {
    icon: <InsightsRounded sx={{ fontSize: 40 }} />,
    title: 'Financial Insights',
    description: 'Get detailed reports and actionable insights to improve your financial health.'
  }
];

function FeaturesSection() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #1E1E1E 0%, #121212 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'radial-gradient(circle at 50% 0%, rgba(255,107,0,0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              component="h2"
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Powerful Features
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '800px', mx: 'auto' }}
            >
              Everything you need to take control of your finances in one place
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderRadius: '16px',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: 'rgba(255,107,0,0.2)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      borderColor: 'primary.main',
                      '& .feature-icon': {
                        transform: 'scale(1.1)',
                        color: 'primary.main',
                      }
                    }
                  }}
                >
                  <Box
                    className="feature-icon"
                    sx={{
                      color: 'rgba(255,107,0,0.8)',
                      mb: 2,
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default FeaturesSection;