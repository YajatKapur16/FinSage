import React, { useState } from 'react';
import { Card, Typography, TextField, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useForumContext } from '../../contexts/ForumContext';

function CreateThread({ onThreadCreated }) {
  const { createThread, loading } = useForumContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      await createThread({ title, description });
      setTitle('');
      setDescription('');
      if (onThreadCreated) onThreadCreated();
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          p: 3,
          position: 'sticky',
          top: '2rem',
          bgcolor: 'rgba(255,255,255,0.03)',
          border: '1px solid',
          borderColor: 'rgba(255,107,0,0.2)',
          borderRadius: '12px',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
            background: 'linear-gradient(90deg, #FF6B00 30%, #FF8C00 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Start a Discussion
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.03)',
                '&:hover': {
                  '& > fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }
            }}
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.03)',
                '&:hover': {
                  '& > fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }
            }}
            required
          />
          <Box textAlign="right">
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              {loading ? 'Creating...' : 'Create Thread'}
            </Button>
          </Box>
        </form>
      </Card>
    </motion.div>
  );
}

export default CreateThread;