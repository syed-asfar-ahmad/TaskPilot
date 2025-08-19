const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId, content, messageType = 'text', fileUrl, fileName } = req.body;
    const userId = req.user.id;

    // Verify chat exists and user is participant
    const chat = await Chat.findOne({
      chatId: chatId,
      participants: userId,
      isActive: true
    }).populate('participants', 'name email profilePicture');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create new message
    const newMessage = new Message({
      chatId: chatId,
      sender: userId,
      content: content,
      messageType: messageType,
      fileUrl: fileUrl,
      fileName: fileName,
      readBy: [{ user: userId, readAt: new Date() }] // Sender has read their own message
    });

    await newMessage.save();

    // Update chat's last message
    await Chat.findOneAndUpdate(
      { chatId: chatId },
      {
        lastMessage: {
          text: content,
          sender: userId,
          timestamp: new Date()
        }
      }
    );

    // Populate sender info for response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email profilePicture');

    // Send notifications to other participants
    const sender = await User.findById(userId);
    if (sender) {
      await NotificationService.notifyNewMessage(
        populatedMessage, 
        sender, 
        chat, 
        chat.participants
      );
    }

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.to(chatId).emit('new_message', {
        chatId: chatId,
        message: populatedMessage
      });
    }

    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a chat
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify chat exists and user is participant
    const chat = await Chat.findOne({
      chatId: chatId,
      participants: userId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Get messages with pagination
    const messages = await Message.find({
      chatId: chatId,
      isDeleted: false
    })
    .populate('sender', 'name email profilePicture')
    .populate('readBy.user', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Message.countDocuments({
      chatId: chatId,
      isDeleted: false
    });

    res.json({
      messages: messages.reverse(), // Reverse to get chronological order
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalMessages: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user has already read this message
    const alreadyRead = message.readBy.some(read => read.user.toString() === userId);
    
    if (!alreadyRead) {
      message.readBy.push({
        user: userId,
        readAt: new Date()
      });
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread message count for a user
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all chats where user is participant
    const userChats = await Chat.find({
      participants: userId,
      isActive: true
    });

    const chatIds = userChats.map(chat => chat.chatId);

    // Count unread messages
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          chatId: { $in: chatIds },
          sender: { $ne: userId },
          isDeleted: false,
          $or: [
            { readBy: { $exists: false } },
            { 'readBy.user': { $ne: userId } }
          ]
        }
      },
      {
        $group: {
          _id: '$chatId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object for easier access
    const unreadMap = {};
    unreadCounts.forEach(item => {
      unreadMap[item._id] = item.count;
    });

    res.json(unreadMap);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getChatMessages,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount
};
