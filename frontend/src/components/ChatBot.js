import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Card,
  Paper,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: input }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://a633-27-60-172-216.ngrok-free.app/query', {
        text: input
      });
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', content: response.data.response }]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4, px: 2, minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(180deg, #121212 0%, #1E1E1E 100%)' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: 'white' }}>
            AI Assistant
          </Typography>

          <Card sx={{ 
            p: 3, 
            bgcolor: 'rgba(255,255,255,0.03)', 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 2,
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box
              ref={chatContainerRef}
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                mb: 3,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#FF6B00',
                  borderRadius: '4px',
                  '&:hover': {
                    background: '#FF8C00',
                  },
                },
              }}
            >
              {messages.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  background: 'radial-gradient(circle at 50% 50%, rgba(255,107,0,0.1) 0%, rgba(0,0,0,0) 70%)',
                  borderRadius: 2
                }}>
                  <Typography 
                    variant="h4" 
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    Welcome to FinSage AI Assistant
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Ask me anything about your finances!
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: message.type === 'user' ? 'rgba(255,107,0,0.1)' : 'rgba(255,255,255,0.03)',
                      borderRadius: 2,
                      maxWidth: '80%',
                      ml: message.type === 'user' ? 'auto' : 0,
                      border: '1px solid',
                      borderColor: message.type === 'user' ? 'rgba(255,107,0,0.2)' : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </Paper>
                ))
              )}
              {isLoading && (
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    borderRadius: 2,
                    maxWidth: '80%',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: '#FF6B00' }} />
                    <Typography color="text.secondary">FinSage is thinking...</Typography>
                  </Box>
                </Paper>
              )}
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                gap: 2,
                mt: 'auto',
              }}
            >
              <TextField
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FinSage..."
                variant="filled"
                disabled={isLoading}
                sx={{
                  '& .MuiFilledInput-root': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                    borderRadius: 2,
                  }
                }}
              />
              <IconButton 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ChatBot;