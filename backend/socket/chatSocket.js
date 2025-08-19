const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store online users
const onlineUsers = new Map();

const setupChatSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email role');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    
    // Add user to online users
    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user
    });

    // Join user to their personal room
    socket.join(socket.userId);

    // Emit online status to all connected users
    io.emit('user_online', {
      userId: socket.userId,
      user: socket.user
    });

    // Handle joining chat rooms
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
    });

    // Handle leaving chat rooms
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
    });

    // Handle new message
    socket.on('send_message', (data) => {
      const { chatId, message } = data;
      
      // Emit message to all users in the chat room
      socket.to(chatId).emit('new_message', {
        chatId,
        message,
        sender: socket.user
      });
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_typing', {
        chatId,
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_stop_typing', {
        chatId,
        userId: socket.userId
      });
    });

    // Handle read receipts
    socket.on('message_read', (data) => {
      const { chatId, messageId } = data;
      socket.to(chatId).emit('message_read_receipt', {
        chatId,
        messageId,
        readBy: socket.userId,
        readAt: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      
      // Remove user from online users
      onlineUsers.delete(socket.userId);
      
      // Emit offline status to all connected users
      io.emit('user_offline', {
        userId: socket.userId
      });
    });
  });

  return io;
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(onlineUsers.values());
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

// Helper function to emit to specific user
const emitToUser = (userId, event, data) => {
  const userData = onlineUsers.get(userId);
  if (userData) {
    global.io.to(userData.socketId).emit(event, data);
  }
};

module.exports = {
  setupChatSocket,
  getOnlineUsers,
  isUserOnline,
  emitToUser
};
