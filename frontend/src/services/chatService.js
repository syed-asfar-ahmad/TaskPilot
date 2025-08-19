import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const createAuthInstance = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Chat API calls
export const chatService = {
  // Get all chats for current user
  getUserChats: async () => {
    try {
      const response = await createAuthInstance().get('/chats/user-chats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create or get existing chat
  createOrGetChat: async (participantId, chatType = 'direct') => {
    try {
      const response = await createAuthInstance().post('/chats/create-chat', {
        participantId,
        chatType
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create team chat
  createTeamChat: async (teamId) => {
    try {
      const response = await createAuthInstance().post('/chats/create-team-chat', {
        teamId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get available users for chat
  getAvailableUsers: async () => {
    try {
      const response = await createAuthInstance().get('/chats/available-users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark chat as read
  markChatAsRead: async (chatId) => {
    try {
      const response = await createAuthInstance().put(`/chats/${chatId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send message
  sendMessage: async (chatId, content, messageType = 'text', fileUrl = null, fileName = null) => {
    try {
      const response = await createAuthInstance().post('/chats/messages', {
        chatId,
        content,
        messageType,
        fileUrl,
        fileName
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get messages for a chat
  getChatMessages: async (chatId, page = 1, limit = 50) => {
    try {
      const response = await createAuthInstance().get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark message as read
  markMessageAsRead: async (messageId) => {
    try {
      const response = await createAuthInstance().put(`/chats/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await createAuthInstance().delete(`/chats/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await createAuthInstance().get('/chats/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete chat
  deleteChat: async (chatId) => {
    try {
      const response = await createAuthInstance().delete(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
