import React from 'react';
import { Container, Typography, Box, Card, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { SmartToyRounded, AutoGraphRounded, AttachMoneyRounded } from '@mui/icons-material';

const features = [
  {
    icon: <SmartToyRounded sx={{ fontSize: 40 }} />,
    title: 'AI-Powered Assistant',
    description: 'Get instant answers to your financial questions with our intelligent chatbot.'
  },
  {
    icon: <AutoGraphRounded sx={{ fontSize: 40 }} />,
    title: 'Smart Analysis',
    description: 'Receive personalized insights and recommendations based on your spending patterns.'
  },
  {
    icon: <AttachMoneyRounded sx={{ fontSize: 40 }} />,
    title: 'Budget Guidance',
    description: 'Get real-time suggestions to help you stay within your budget goals.'
  }
];

function ChatbotSection() {
  return (
    <Box
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
          background: 'radial-gradient(circle at 50% 50%, rgba(255,107,0,0.15) 0%, rgba(0,0,0,0) 70%)',
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
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Financial Assistant
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '800px', mx: 'auto' }}
            >
              Your personal financial advisor available 24/7
            </Typography>
          </motion.div>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr' },
            gap: 6,
            alignItems: 'center'
          }}
        >
          {/* Features List */}
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid',
                      borderColor: 'rgba(255,107,0,0.2)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateX(10px)',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderColor: 'primary.main',
                        '& .feature-icon': {
                          color: 'primary.main',
                          transform: 'scale(1.1)',
                        }
                      }
                    }}
                  >
                    <Box
                      className="feature-icon"
                      sx={{
                        color: 'rgba(255,107,0,0.8)',
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Chat Interface Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <Card
              sx={{
                p: 3,
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid',
                borderColor: 'rgba(255,107,0,0.2)',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Chat Messages */}
              <Box sx={{ flex: 1, mb: 2, position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <SmartToyRounded sx={{ fontSize: 60, color: 'primary.main' }} />
                  <Typography variant="h6" color="text.secondary" textAlign="center">
                    Ask me anything about your finances
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Start Chat
                  </Button>
                </Box>
              </Box>
            </Card>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

export default ChatbotSection;