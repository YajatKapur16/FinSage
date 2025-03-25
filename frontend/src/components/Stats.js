import React from 'react';
import { Container, Typography, Grid, Box, Card } from '@mui/material';
import { motion } from 'framer-motion';

const stats = [
  {
    value: '95%',
    label: 'Accuracy Rate',
    description: 'In expense categorization'
  },
  {
    value: '₹10M+',
    label: 'Expenses Tracked',
    description: 'Managed through platform'
  },
  {
    value: '24/7',
    label: 'AI Support',
    description: 'Always available'
  },
  {
    value: '50K+',
    label: 'Active Users',
    description: 'Trust our platform'
  }
];

function Stats() {
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
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                    textAlign: 'center',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: 'rgba(255,107,0,0.2)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      borderColor: 'primary.main',
                      '& .stat-value': {
                        background: 'linear-gradient(90deg, #FF6B00 0%, #FF8C00 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }
                    }
                  }}
                >
                  <Typography
                    className="stat-value"
                    variant="h3"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: 'primary.main',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ 
                      mb: 1,
                      fontWeight: 600,
                      background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {stat.description}
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

export default Stats;