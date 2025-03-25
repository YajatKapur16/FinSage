import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  AccountCircle as AccountIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useForum } from '../../contexts/ForumContext';

const ThreadDialog = ({ open, thread, onClose }) => {
  const {
    getThreadDetails,
    addReply,
    deleteThread,
    loading,
    error
  } = useForum();

  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [replyError, setReplyError] = useState('');

  useEffect(() => {
    if (thread && open) {
      loadThreadDetails();
    }
  }, [thread, open]);

  const loadThreadDetails = async () => {
    if (!thread) return;
    try {
      const threadDetails = await getThreadDetails(thread.id);
      setReplies(threadDetails.replies || []);
    } catch (err) {
      console.error('Error loading thread details:', err);
      setReplyError('Failed to load thread details');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) {
      setReplyError('Reply cannot be empty');
      return;
    }

    try {
      await addReply(thread.id, { content: newReply });
      setNewReply('');
      setReplyError('');
      loadThreadDetails(); // Refresh replies
    } catch (err) {
      console.error('Error adding reply:', err);
      setReplyError(err.message || 'Failed to add reply');
    }
  };

  const handleDelete = async () => {
    if (!thread) return;
    try {
      await deleteThread(thread.id);
      onClose();
    } catch (err) {
      console.error('Error deleting thread:', err);
      setReplyError(err.message || 'Failed to delete thread');
    }
  };

  if (!thread) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{thread.title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            {thread.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">User {thread.user_id}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">
                {format(new Date(thread.created_at), 'PPp')}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Replies
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <List>
            {replies.map((reply) => (
              <ListItem
                key={reply.id}
                component={Paper}
                variant="outlined"
                sx={{ mb: 2, display: 'block' }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountIcon fontSize="small" />
                        <Typography variant="subtitle2">
                          User {reply.user_id}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(reply.created_at), 'PPp')}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mt: 1 }}
                    >
                      {reply.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
            {replies.length === 0 && (
              <Typography color="text.secondary" align="center">
                No replies yet
              </Typography>
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ flexDirection: 'column', p: 2 }}>
        {replyError && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {replyError}
          </Alert>
        )}
        <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Write a reply..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            error={!!replyError && !newReply.trim()}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleReplySubmit}
            disabled={!newReply.trim()}
            startIcon={<SendIcon />}
          >
            Reply
          </Button>
        </Box>
        <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete Thread
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ThreadDialog;