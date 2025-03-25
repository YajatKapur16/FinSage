import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useForum } from '../../contexts/ForumContext';
import ThreadList from './ThreadList';
import NewThreadDialog from './NewThreadDialog';
import ThreadDialog from './ThreadDialog';

const Forum = () => {
  const {
    threads,
    loading,
    error,
    fetchThreads,
    createThread,
  } = useForum();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openNewThread, setOpenNewThread] = useState(false);
  const [openThreadView, setOpenThreadView] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    // Implement debounced search here
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNewThreadClick = () => {
    setOpenNewThread(true);
  };

  const handleThreadClick = (thread) => {
    setSelectedThread(thread);
    setOpenThreadView(true);
  };

  const handleCloseNewThread = () => {
    setOpenNewThread(false);
  };

  const handleCloseThreadView = () => {
    setOpenThreadView(false);
    setSelectedThread(null);
  };

  const handleCreateThread = async (threadData) => {
    try {
      await createThread(threadData);
      setSnackbar({
        open: true,
        message: 'Thread created successfully!',
        severity: 'success'
      });
      handleCloseNewThread();
      fetchThreads(); // Refresh the thread list
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to create thread',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Forum
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewThreadClick}
          >
            New Thread
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search threads..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="All Threads" />
            <Tab label="Recent" />
            <Tab label="Popular" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <ThreadList threads={threads} onThreadClick={handleThreadClick} />
        )}
      </Box>

      <NewThreadDialog
        open={openNewThread}
        onClose={handleCloseNewThread}
        onCreate={handleCreateThread}
      />

      <ThreadDialog
        open={openThreadView}
        thread={selectedThread}
        onClose={handleCloseThreadView}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Forum;
