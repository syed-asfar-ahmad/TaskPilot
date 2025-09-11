const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/auth'); 
 
const User = require('../models/User');

const {
  updateUserProfile,
  getUserProfile,
  getAllUsers,
} = require('../controllers/userController');

// GET only team members
router.get('/team-members', verifyToken, async (req, res) => {
  try {
    const teamMembers = await User.find({ role: 'Team Member' }).select('_id name email profilePicture');
    res.json(teamMembers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET only managers
router.get('/managers', verifyToken, async (req, res) => {
  try {
    const managers = await User.find({ role: 'Manager' }).select('_id name email profilePicture');
    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch managers' });
  }
});

// GET manager's team members (for managers creating projects)
router.get('/my-team-members', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied: Managers only' });
    }

    // First, find the team where this manager is assigned
    const manager = await User.findById(req.user.id).populate('teamId');
    
    if (!manager.teamId) {
      // If manager is not assigned to a team via teamId, try to find team where they are the manager
      const Team = require('../models/Team');
      const team = await Team.findOne({ manager: manager._id });
      
      if (!team) {
        return res.status(404).json({ error: 'Manager not assigned to any team' });
      }
      
      // Find all users who belong to this team (either via teamId or as team members)
      const teamMembers = await User.find({
        $or: [
          { teamId: team._id, role: 'Team Member' },
          { _id: { $in: team.members }, role: 'Team Member' }
        ]
      }).select('_id name email profilePicture role bio dateOfBirth position gender');
      
      res.json(teamMembers);
    } else {
      // Manager has teamId assigned
      const teamMembers = await User.find({ 
        teamId: manager.teamId._id,
        role: 'Team Member'
      }).select('_id name email profilePicture role bio dateOfBirth position gender');
      
      res.json(teamMembers);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch manager team members' });
  }
});

// GET manager's team managers (for managers creating projects)
router.get('/my-team-managers', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Access denied: Managers only' });
    }

    const manager = await User.findById(req.user.id).populate('teamId');
    if (!manager.teamId) {
      // Try to find team where they are the manager
      const Team = require('../models/Team');
      const team = await Team.findOne({ manager: manager._id });
      
      if (!team) {
        return res.status(404).json({ error: 'Manager not assigned to any team' });
      }

      const teamManagers = await User.find({ 
        $or: [
          { teamId: team._id, role: 'Manager' },
          { _id: { $in: team.members }, role: 'Manager' }
        ]
      }).select('_id name email');
      
      res.json(teamManagers);
    } else {
      const teamManagers = await User.find({ 
        teamId: manager.teamId._id,
        role: 'Manager'
      }).select('_id name email');
      
      res.json(teamManagers);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team managers' });
  }
});

// Setup team assignments (Admin only - temporary)
router.post('/setup-team-assignments', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const Team = require('../models/Team');
    
    // Get all teams
    const teams = await Team.find().populate('manager', 'name email').populate('members', 'name email role');
    
    // Get all team members
    const teamMembers = await User.find({ role: 'Team Member' });
    
    // Get all managers
    const managers = await User.find({ role: 'Manager' });
    
    const results = [];
    
    // For each team, assign team members to that team
    for (const team of teams) {
      // Assign team members to this team
      const updatedMembers = await User.updateMany(
        { role: 'Team Member' },
        { teamId: team._id }
      );
      
      // Assign manager to this team
      if (team.manager) {
        await User.findByIdAndUpdate(team.manager._id, { teamId: team._id });
      }
      
      results.push({
        team: team.name,
        manager: team.manager?.name || 'No manager',
        membersAssigned: updatedMembers.modifiedCount
      });
    }
    
    res.json({
      message: 'Team assignments setup completed',
      results
    });
  } catch (err) {
    console.error('Setup team assignments error:', err);
    res.status(500).json({ error: 'Failed to setup team assignments' });
  }
});

// PUT update user role (Admin or Manager for their team members)
router.put('/:userId/role', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or manager
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ message: 'Access denied: Admin or Manager only' });
    }

    const { userId } = req.params;
    const { newRole } = req.body;

    // Validate role - Admin role is reserved for main admin only
    if (!['Team Member', 'Manager'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role. Admin role is reserved for main administrator only.' });
    }

    // Prevent admin from demoting themselves
    if (userId === req.user.id && newRole !== 'Admin') {
      return res.status(400).json({ message: 'Cannot demote yourself' });
    }

    // Get the user to be updated
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If manager, ensure they can only update their team members
    if (req.user.role === 'Manager') {
      const manager = await User.findById(req.user.id).populate('teamId');
      if (!manager.teamId) {
        return res.status(403).json({ message: 'Manager not assigned to any team' });
      }
      
      // Check if the user to be updated is in the manager's team
      if (userToUpdate.teamId?.toString() !== manager.teamId._id.toString()) {
        return res.status(403).json({ message: 'Can only update team members' });
      }
    }

    // Prevent modification of main admin account (ahmad@example.com)
    if (userToUpdate.email === 'ahmad@example.com') {
      return res.status(403).json({ message: 'Cannot modify main administrator account' });
    }

    // Role hierarchy restrictions - only Team Member ↔ Manager allowed
    if (userToUpdate.role === 'Team Member' && newRole !== 'Manager') {
      return res.status(400).json({ message: 'Team Members can only be promoted to Manager' });
    }

    if (userToUpdate.role === 'Manager' && newRole !== 'Team Member') {
      return res.status(400).json({ message: 'Managers can only be demoted to Team Member' });
    }

    // If promoting to Manager, clear their teamId so they can be assigned to new teams
    const updateData = { role: newRole };
    if (newRole === 'Manager') {
      updateData.teamId = null;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.json({ message: 'Role updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// GET profile (protected)
router.get('/profile', verifyToken, getUserProfile);

// PUT profile (without image upload - handled by Vercel Blob)
router.put('/profile', verifyToken, updateUserProfile);

router.get(
  '/',
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ message: 'Access denied: Admins and Managers only' });
    }
    next();
  },
  getAllUsers
);

module.exports = router;
