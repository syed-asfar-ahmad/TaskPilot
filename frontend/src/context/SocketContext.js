import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection
    const newSocket = io(process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
    });

    // User online/offline events
    newSocket.on('user_online', (data) => {
      setOnlineUsers(prev => new Map(prev).set(data.userId, data.user));
    });

    newSocket.on('user_offline', (data) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  // Socket event handlers
  const joinChat = (chatId) => {
    if (socket && isConnected) {
      socket.emit('join_chat', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket && isConnected) {
      socket.emit('leave_chat', chatId);
    }
  };

  const sendMessage = (chatId, message) => {
    if (socket && isConnected) {
      socket.emit('send_message', { chatId, message });
    }
  };

  const startTyping = (chatId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { chatId });
    }
  };

  const markMessageAsRead = (chatId, messageId) => {
    if (socket && isConnected) {
      socket.emit('message_read', { chatId, messageId });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const value = {
    socket,
    isConnected,
    onlineUsers: Array.from(onlineUsers.values()),
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    isUserOnline
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
