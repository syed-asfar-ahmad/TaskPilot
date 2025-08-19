const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Team = require('../models/Team');

// Get all chats for a user
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all chats where user is a participant
    const chats = await Chat.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email profilePicture role')
    .populate('lastMessage.sender', 'name')
    .populate('teamId', 'name')
    .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or get existing chat between two users
const createOrGetChat = async (req, res) => {
  try {
    const { participantId, chatType = 'direct' } = req.body;
    const userId = req.user.id;

    // Check if chat already exists
    let existingChat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
      chatType: 'direct',
      isActive: true
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const newChat = new Chat({
      participants: [userId, participantId],
      chatType: chatType
    });

    await newChat.save();
    
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email profilePicture role');

    res.json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create team chat
const createTeamChat = async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user.id;

    // Verify user is manager of the team
    const team = await Team.findOne({
      _id: teamId,
      manager: userId
    });

    if (!team) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if team chat already exists
    let existingChat = await Chat.findOne({
      teamId: teamId,
      chatType: 'team',
      isActive: true
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new team chat
    const newChat = new Chat({
      participants: team.members,
      chatType: 'team',
      teamId: teamId
    });

    await newChat.save();
    
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email profilePicture role')
      .populate('teamId', 'name');

    res.json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available users for chat based on role
const getAvailableUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId);

    let availableUsers = [];

    if (currentUser.role === 'Admin') {
      // Admin can chat with all managers
      availableUsers = await User.find({
        role: 'Manager',
        _id: { $ne: userId }
      }).select('name email profilePicture role');
    } else if (currentUser.role === 'Manager') {
      // Manager can chat with admin and team members
      const adminUsers = await User.find({ role: 'Admin' }).select('name email profilePicture role');
      const teamMembers = await User.find({
        teamId: currentUser.teamId,
        _id: { $ne: userId }
      }).select('name email profilePicture role');
      availableUsers = [...adminUsers, ...teamMembers];
    } else {
      // Team member: get all teammates from all projects they are part of
      // 1. Find all projects where this user is a team member
      const projects = await require('../models/Project').find({
        teamMembers: userId
      }).populate('teamMembers', 'name email profilePicture role');

      // 2. Collect all unique teammates (excluding self)
      const teammateMap = new Map();
      projects.forEach(project => {
        project.teamMembers.forEach(member => {
          if (member._id.toString() !== userId && !teammateMap.has(member._id.toString())) {
            teammateMap.set(member._id.toString(), member);
          }
        });
      });

      // 3. Optionally, add their manager if available
      let manager = null;
      if (currentUser.teamId) {
        const team = await Team.findById(currentUser.teamId);
        if (team && team.manager) {
          manager = await User.findById(team.manager).select('name email profilePicture role');
        }
      }
      if (manager && manager._id.toString() !== userId) {
        teammateMap.set(manager._id.toString(), manager);
      }

      availableUsers = Array.from(teammateMap.values());
    }

    res.json(availableUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark chat as read
const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Mark all messages in chat as read by this user
    await Message.updateMany(
      { 
        chatId: chatId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Chat marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete chat
const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Find the chat and verify user is a participant
    const chat = await Chat.findOne({
      chatId: chatId,
      participants: userId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Soft delete the chat by setting isActive to false
    await Chat.findOneAndUpdate({ chatId: chatId }, { isActive: false });

    // Also delete all messages in this chat
    await Message.deleteMany({ chatId: chatId });

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserChats,
  createOrGetChat,
  createTeamChat,
  getAvailableUsers,
  markChatAsRead,
  deleteChat
};

