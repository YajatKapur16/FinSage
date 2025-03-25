import api from './api';
import authService from './authService';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleApiError = async (error, retryCount = 0) => {
  if (error.response?.status === 401 && retryCount < MAX_RETRIES) {
    try {
      await authService.refreshToken();
      return { shouldRetry: true };
    } catch (refreshError) {
      authService.logout();
      throw new Error('Authentication expired. Please login again.');
    }
  }

  let errorMessage = error.response?.data?.detail || error.message;
  if (error.response?.status === 404) {
    errorMessage = 'Thread or reply not found. It may have been deleted.';
  } else if (error.response?.status === 403) {
    errorMessage = 'You do not have permission to perform this action.';
  } else if (error.response?.status === 400) {
    errorMessage = error.response.data?.detail || 'Invalid request. Please check your input.';
  }

  console.error('Forum API Error:', errorMessage, error);
  throw new Error(errorMessage);
};

const forumService = {
  getAllThreads: async (params = {}) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log('Fetching forum threads with params:', params);
        const { limit = 10, offset = 0 } = params;
        const queryParams = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString()
        });
        
        const response = await api.get(`/forum/threads?${queryParams}`);
        console.log('Successfully fetched threads:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching forum threads:', error);
        const result = await handleApiError(error, retryCount);
        const shouldRetry = result?.shouldRetry;
        if (shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying threads fetch (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw new Error('Failed to load forum threads. Please try again later.');
      }
    }
  },

  getThread: async (threadId) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log(`Fetching thread with ID ${threadId}`);
        const response = await api.get(`/forum/threads/${threadId}`);
        console.log('Successfully fetched thread:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Error fetching thread ${threadId}:`, error);
        const result = await handleApiError(error, retryCount);
        const shouldRetry = result?.shouldRetry;
        if (shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying thread fetch (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw new Error('Failed to load thread details. Please try again later.');
      }
    }
  },

  createThread: async (threadData) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log('Creating thread:', threadData);
        const payload = {
          title: threadData.title.trim(),
          description: threadData.description.trim()
        };
        
        const response = await api.post('/forum/threads', payload);
        console.log('Successfully created thread:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error creating thread:', error);
        const result = await handleApiError(error, retryCount);
        const shouldRetry = result?.shouldRetry;
        if (shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying thread creation (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw new Error('Failed to create thread. Please check your input and try again.');
      }
    }
  },

  deleteThread: async (threadId) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log(`Deleting thread ${threadId}`);
        await api.delete(`/forum/threads/${threadId}`);
        console.log('Successfully deleted thread');
        return true;
      } catch (error) {
        console.error(`Error deleting thread ${threadId}:`, error);
        const result = await handleApiError(error, retryCount);
        const shouldRetry = result?.shouldRetry;
        if (shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying thread deletion (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw new Error('Failed to delete thread. Please try again later.');
      }
    }
  },

  addReply: async (threadId, replyData) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log(`Adding reply to thread ${threadId}:`, replyData);
        const payload = {
          content: replyData.content.trim()
        };
        
        const response = await api.post(`/forum/threads/${threadId}/replies`, payload);
        console.log('Successfully added reply:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Error adding reply to thread ${threadId}:`, error);
        const result = await handleApiError(error, retryCount);
        const shouldRetry = result?.shouldRetry;
        if (shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying reply creation (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw new Error('Failed to add reply. Please try again.');
      }
    }
  },

  getLatestThreads: async () => {
    let retryCount = 0;
    while (true) {
      try {
        console.log('Fetching latest threads');
        const response = await api.get('/forum/latest-threads');
        console.log('Successfully fetched latest threads:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching latest threads:', error);
        const result = await handleApiError(error, retryCount);
        const shouldRetry = result?.shouldRetry;
        if (shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying latest threads fetch (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw new Error('Failed to load latest threads. Please try again later.');
      }
    }
  },

  deleteReply: async (replyId) => {
    let retryCount = 0;
    while (true) {
      try {
        console.log(`Deleting reply ${replyId}`);
        await api.delete(`/forum/replies/${replyId}`);
        console.log('Successfully deleted reply');
        return true;
      } catch (error) {
        console.error(`Error deleting reply ${replyId}:`, error);
        const result = await handleApiError(error, retryCount);
        const shouldRetry = result?.shouldRetry;
        if (shouldRetry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying reply deletion (${retryCount}/${MAX_RETRIES})...`);
          await sleep(RETRY_DELAY * retryCount);
          continue;
        }
        throw new Error('Failed to delete reply. Please try again later.');
      }
    }
  }
};

export default forumService;