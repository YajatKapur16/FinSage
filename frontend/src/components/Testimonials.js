import React from 'react';
import { Container, Typography, Grid, Box, Avatar, Card } from '@mui/material';
import { motion } from 'framer-motion';
import { FormatQuote } from '@mui/icons-material';

const testimonials = [
  {
    name: 'Sarah Perera',
    role: 'Small Business Owner',
    image: '/avatars/sarah.jpg',
    quote: 'FinSage has transformed how I manage my business finances. The AI categorization is incredibly accurate and saves me hours each month.'
  },
  {
    name: 'Michael Fernando',
    role: 'Software Engineer',
    image: '/avatars/michael.jpg',
    quote: 'The smart alerts have helped me stay on top of my spending. The AI chatbot gives great financial advice whenever I need it.'
  },
  {
    name: 'Emily Silva',
    role: 'Freelance Designer',
    image: '/avatars/emily.jpg',
    quote: 'As a freelancer, tracking expenses was always a hassle. FinSage makes it effortless and the insights help me make better financial decisions.'
  }
];

function Testimonials() {
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
              What Our Users Say
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '800px', mx: 'auto' }}
            >
              Join thousands of satisfied users who have transformed their financial management
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'visible',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: 'rgba(255,107,0,0.2)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      borderColor: 'primary.main',
                      '& .quote-icon': {
                        color: 'primary.main',
                      }
                    }
                  }}
                >
                  <Box
                    className="quote-icon"
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: 20,
                      color: 'rgba(255,107,0,0.8)',
                      transform: 'rotate(180deg)',
                      transition: 'color 0.3s ease-in-out',
                    }}
                  >
                    <FormatQuote sx={{ fontSize: 40 }} />
                  </Box>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      mt: 2,
                      color: 'text.secondary',
                      lineHeight: 1.8,
                      flex: 1,
                    }}
                  >
                    "{testimonial.quote}"
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={testimonial.image}
                      alt={testimonial.name}
                      sx={{
                        width: 56,
                        height: 56,
                        mr: 2,
                        border: '2px solid',
                        borderColor: 'primary.main',
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Testimonials;