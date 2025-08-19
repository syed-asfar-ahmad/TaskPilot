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
    // Find users whose teamId matches any team managed by this manager
    const teams = await require('../models/Team').find({ manager: req.user.id });
    const teamIds = teams.map(team => team._id);
    const teamMembers = await User.find({ teamId: { $in: teamIds } }).select('_id name email profilePicture');
    res.json(teamMembers);
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
      return res.status(404).json({ error: 'Manager not assigned to any team' });
    }

    const teamManagers = await User.find({ 
      teamId: manager.teamId._id,
      role: 'Manager'
    }).select('_id name email');
    
    res.json(teamManagers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team managers' });
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

    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
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
