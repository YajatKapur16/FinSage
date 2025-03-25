import React, { createContext, useContext, useState, useCallback } from 'react';
import forumService from '../services/forumService';

const ForumContext = createContext();

export const ForumProvider = ({ children }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await forumService.getAllThreads();
      setThreads(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch threads');
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createThread = useCallback(async (threadData) => {
    try {
      setLoading(true);
      setError(null);
      const newThread = await forumService.createThread(threadData);
      setThreads(prevThreads => [newThread, ...prevThreads]);
      return newThread;
    } catch (err) {
      setError(err.message || 'Failed to create thread');
      console.error('Error creating thread:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getThreadDetails = useCallback(async (threadId) => {
    try {
      setLoading(true);
      setError(null);
      return await forumService.getThread(threadId);
    } catch (err) {
      setError(err.message || 'Failed to fetch thread details');
      console.error('Error fetching thread details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addReply = useCallback(async (threadId, replyData) => {
    try {
      setLoading(true);
      setError(null);
      return await forumService.addReply(threadId, replyData);
    } catch (err) {
      setError(err.message || 'Failed to add reply');
      console.error('Error adding reply:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteThread = useCallback(async (threadId) => {
    try {
      setLoading(true);
      setError(null);
      await forumService.deleteThread(threadId);
      setThreads(prevThreads => prevThreads.filter(thread => thread.id !== threadId));
    } catch (err) {
      setError(err.message || 'Failed to delete thread');
      console.error('Error deleting thread:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    threads,
    loading,
    error,
    fetchThreads,
    createThread,
    getThreadDetails,
    addReply,
    deleteThread,
  };

  return (
    <ForumContext.Provider value={value}>
      {children}
    </ForumContext.Provider>
  );
};

export const useForum = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
};

export default ForumContext;