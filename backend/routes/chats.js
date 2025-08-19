const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const chatController = require('../controllers/chatController');
const messageController = require('../controllers/messageController');

// Chat routes
router.get('/user-chats', verifyToken, chatController.getUserChats);
router.post('/create-chat', verifyToken, chatController.createOrGetChat);
router.post('/create-team-chat', verifyToken, chatController.createTeamChat);
router.get('/available-users', verifyToken, chatController.getAvailableUsers);
router.put('/:chatId/read', verifyToken, chatController.markChatAsRead);
router.delete('/:chatId', verifyToken, chatController.deleteChat);

// Message routes
router.post('/messages', verifyToken, messageController.sendMessage);
router.get('/:chatId/messages', verifyToken, messageController.getChatMessages);
router.put('/messages/:messageId/read', verifyToken, messageController.markMessageAsRead);
router.delete('/messages/:messageId', verifyToken, messageController.deleteMessage);
router.get('/unread-count', verifyToken, messageController.getUnreadCount);

module.exports = router;
