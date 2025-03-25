import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  AccountCircle as AccountIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useForum } from '../../contexts/ForumContext';

const ThreadDetail = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const {
    getThreadDetails,
    addReply,
    deleteThread,
    loading,
    error
  } = useForum();

  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadThread();
    fetchUserData();
  }, [threadId]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get('/auth/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const loadThread = async () => {
    try {
      const threadDetails = await getThreadDetails(threadId);
      setThread(threadDetails);
      setReplies(threadDetails.replies || []);
    } catch (err) {
      console.error('Error loading thread:', err);
      setReplyError('Thread not found or error loading thread details');
    }
  };

  const handleBack = () => {
    navigate('/forum');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) {
      setReplyError('Reply cannot be empty');
      return;
    }

    try {
      await addReply(threadId, { content: newReply });
      setNewReply('');
      setReplyError('');
      loadThread(); // Refresh the thread to show new reply
    } catch (err) {
      console.error('Error adding reply:', err);
      setReplyError(err.message || 'Failed to add reply');
    }
  };

  const handleDelete = async () => {
    if (!thread) return;
    try {
      await deleteThread(thread.id);
      navigate('/forum');
    } catch (err) {
      console.error('Error deleting thread:', err);
      setReplyError(err.message || 'Failed to delete thread');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !thread) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" onClick={handleBack}>
              Back to Forum
            </Button>
          }
        >
          {error || 'Thread not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Forum
        </Button>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {thread.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">User {thread.user_id}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {format(new Date(thread.created_at), 'PPp')}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {thread.description}
          </Typography>

          {userData && userData.id === thread.user_id && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete Thread
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Replies
      </Typography>

      <Box sx={{ mb: 4 }}>
        {replies.map((reply) => (
          <Paper key={reply.id} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
            <Typography variant="body1">
              {reply.content}
            </Typography>
          </Paper>
        ))}

        {replies.length === 0 && (
          <Typography color="text.secondary" align="center">
            No replies yet
          </Typography>
        )}
      </Box>

      <Paper sx={{ p: 3 }}>
        {replyError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {replyError}
          </Alert>
        )}
        <form onSubmit={handleReplySubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your reply..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            error={!!replyError && !newReply.trim()}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!newReply.trim()}
              startIcon={<SendIcon />}
            >
              Post Reply
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ThreadDetail;