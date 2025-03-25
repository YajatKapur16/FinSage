import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Pagination,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

function ForumSection({ preview = false }) {
  const [threads, setThreads] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userData, setUserData] = useState(null);
  
  // Dialog states
  const [openCreateThreadDialog, setOpenCreateThreadDialog] = useState(false);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState('thread'); // 'thread' or 'reply'
  const [deleteId, setDeleteId] = useState(null);
  
  // Form data
  const [threadFormData, setThreadFormData] = useState({
    title: '',
    description: ''
  });
  const [replyFormData, setReplyFormData] = useState({
    content: ''
  });

  useEffect(() => {
    fetchUserData();
    if (preview) {
      fetchLatestThreads();
    } else {
      fetchThreads();
    }
  }, [preview, page]);

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

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const limit = 10;
      const offset = (page - 1) * limit;
      
      const response = await axios.get(`/forum/threads?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setThreads(response.data);
      // Assuming backend returns total count in headers or a specific field
      setTotalPages(Math.ceil(response.data.length / limit) || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to load forum threads');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestThreads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get('/forum/latest-threads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setThreads(response.data.slice(0, 3)); // Only show first 3 for preview
      setError(null);
    } catch (err) {
      console.error('Error fetching latest threads:', err);
      setError('Failed to load latest forum activity');
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetails = async (threadId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`/forum/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentThread(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching thread details:', err);
      setError('Failed to load thread details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('/forum/threads', threadFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOpenCreateThreadDialog(false);
      setThreadFormData({ title: '', description: '' });
      
      if (preview) {
        fetchLatestThreads();
      } else {
        fetchThreads();
      }
    } catch (err) {
      console.error('Error creating thread:', err);
      setError('Failed to create thread');
    }
  };

  const handleReply = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`/forum/threads/${currentThread.id}/replies`, replyFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOpenReplyDialog(false);
      setReplyFormData({ content: '' });
      
      if (currentThread) {
        fetchThreadDetails(currentThread.id);
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (deleteType === 'thread') {
        await axios.delete(`/forum/threads/${deleteId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (currentThread && currentThread.id === deleteId) {
          setCurrentThread(null);
        }
        
        if (preview) {
          fetchLatestThreads();
        } else {
          fetchThreads();
        }
      } else {
        await axios.delete(`/forum/replies/${deleteId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (currentThread) {
          fetchThreadDetails(currentThread.id);
        }
      }
      
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error(`Error deleting ${deleteType}:`, err);
      setError(`Failed to delete ${deleteType}`);
    }
  };

  const handleThreadClick = (threadId) => {
    if (preview) return; // No thread details in preview mode
    fetchThreadDetails(threadId);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenDeleteDialog = (type, id) => {
    setDeleteType(type);
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const renderThreadList = () => (
    <Box>
      {!preview && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Community Forum
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateThreadDialog(true)}
          >
            New Thread
          </Button>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : threads.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="text.secondary">No threads found</Typography>
        </Box>
      ) : (
        <List>
          {threads.map((thread) => (
            <ListItem 
              key={thread.id}
              alignItems="flex-start"
              button={!preview}
              onClick={() => handleThreadClick(thread.id)}
              disableGutters
              sx={{ 
                mb: 1, 
                p: 2, 
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&:hover': !preview ? { bgcolor: 'background.default' } : {}
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {thread.title.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {thread.title}
                    </Typography>
                    {!preview && userData && (userData.id === thread.user_id || userData.is_admin) && (
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteDialog('thread', thread.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ 
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      {thread.description}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {format(new Date(thread.created_at), "MMM dd, yyyy")}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {!preview && !loading && threads.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Box>
  );

  const renderThreadDetail = () => {
    if (!currentThread) return null;

    return (
      <Box>
        <Button onClick={() => setCurrentThread(null)} sx={{ mb: 2 }}>
          Back to Threads
        </Button>
        
        <Card sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {currentThread.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Posted on {format(new Date(currentThread.created_at), "MMMM dd, yyyy")}
              </Typography>
            </Box>
            {userData && (userData.id === currentThread.user_id || userData.is_admin) && (
              <IconButton 
                color="error"
                onClick={() => handleOpenDeleteDialog('thread', currentThread.id)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          
          <Typography paragraph>
            {currentThread.description}
          </Typography>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<ReplyIcon />}
              onClick={() => setOpenReplyDialog(true)}
            >
              Reply
            </Button>
          </Box>
        </Card>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          {currentThread.replies?.length || 0} Replies
        </Typography>
        
        {currentThread.replies && currentThread.replies.length > 0 ? (
          <List>
            {currentThread.replies.map((reply) => (
              <ListItem
                key={reply.id}
                alignItems="flex-start"
                disableGutters
                sx={{ 
                  mb: 2, 
                  p: 2, 
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {/* Placeholder avatar - in a real app this would be user's avatar */}
                    {reply.user_id}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(reply.created_at), "MMM dd, yyyy")}
                      </Typography>
                      {userData && (userData.id === reply.user_id || userData.is_admin) && (
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog('reply', reply.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography
                      component="span"
                      variant="body1"
                      color="text.primary"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      {reply.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="text.secondary">No replies yet</Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Card sx={{ 
      bgcolor: preview ? 'transparent' : 'background.paper',
      boxShadow: preview ? 0 : 1,
      borderRadius: 2,
      p: preview ? 0 : 3 
    }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {preview ? renderThreadList() : currentThread ? renderThreadDetail() : renderThreadList()}
      
      {/* Create Thread Dialog */}
      <Dialog open={openCreateThreadDialog} onClose={() => setOpenCreateThreadDialog(false)} fullWidth>
        <DialogTitle>Create New Thread</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={threadFormData.title}
            onChange={(e) => setThreadFormData({ ...threadFormData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={threadFormData.description}
            onChange={(e) => setThreadFormData({ ...threadFormData, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateThreadDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCreateThread} variant="contained">
            Create Thread
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reply Dialog */}
      <Dialog open={openReplyDialog} onClose={() => setOpenReplyDialog(false)} fullWidth>
        <DialogTitle>Post Reply</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Your Reply"
            name="content"
            value={replyFormData.content}
            onChange={(e) => setReplyFormData({ ...replyFormData, content: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReplyDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleReply} variant="contained">
            Post Reply
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete {deleteType === 'thread' ? 'Thread' : 'Reply'}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteType}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default ForumSection;