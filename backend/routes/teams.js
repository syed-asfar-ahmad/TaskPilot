const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

// Create a new team (Admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can create teams' });
    }

    const { name, description, managerId } = req.body;

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    // Check if manager exists and is available
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(400).json({ message: 'Manager not found' });
    }

    // Check if manager is already assigned to a team
    if (manager.teamId) {
      return res.status(400).json({ message: 'Manager is already assigned to a team' });
    }

    // Create new team
    const team = new Team({
      name,
      description,
      admin: req.user.id,
      manager: managerId,
      members: [managerId] // Manager is automatically a member
    });

    await team.save();

    // Update manager's teamId
    await User.findByIdAndUpdate(managerId, { teamId: team._id });

    // Send notifications
    const admin = await User.findById(req.user.id);
    const populatedTeam = await Team.findById(team._id)
      .populate('manager', 'name email');

    // Notify admin about team creation
    await NotificationService.notifyTeamCreated(populatedTeam, admin);

    // Notify manager about being assigned to the team
    await NotificationService.notifyTeamMemberJoined(populatedTeam, manager, admin);

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all teams (Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const teams = await Team.find()
      .populate('admin', 'name email profilePicture')
      .populate('manager', 'name email profilePicture')
      .populate('members', 'name email role profilePicture');

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available users for team assignment (Admin only)
router.get('/available-users', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // First, get all users with Manager or Team Member role
    const allUsers = await User.find({ 
      role: { $in: ['Manager', 'Team Member'] }
    }).select('name email role teamId');

    // Filter out users who are already assigned to teams
    const availableUsers = allUsers.filter(user => !user.teamId);

    res.json(availableUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available managers for team creation (Admin only)
router.get('/managers', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all teams to see which managers are already assigned
    const allTeams = await Team.find().select('manager');
    const assignedManagerIds = allTeams.map(team => team.manager.toString());

    // Get managers who are not assigned to any team
    // Check both: teamId field and if they're not in any team's manager field
    const managers = await User.find({ 
      role: 'Manager',
      $and: [
        {
          $or: [
            { teamId: { $exists: false } },
            { teamId: null }
          ]
        },
        {
          _id: { $nin: assignedManagerIds }
        }
      ]
    }).select('name email profilePicture');

    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



// Get teams for signup form (Public route - no auth required)
router.get('/signup-teams', async (req, res) => {
  try {
    const teams = await Team.find({ status: 'active' })
      .select('name description')
      .sort({ name: 1 });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('admin', 'name email profilePicture')
      .populate('manager', 'name email profilePicture')
      .populate('members', 'name email role profilePicture');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to team (Admin or Manager)
router.post('/:id/members', verifyToken, async (req, res) => {
  try {
    const { memberId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user has permission (admin or team manager)
    if (req.user.role !== 'Admin' && team.manager.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if member exists
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if member is already in team
    if (team.members.includes(memberId)) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Add member to team
    team.members.push(memberId);
    await team.save();

    // Update member's teamId
    await User.findByIdAndUpdate(memberId, { teamId: team._id });

    res.json({ message: 'Member added successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from team (Admin or Manager)
router.delete('/:id/members/:memberId', verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user has permission (admin or team manager)
    if (req.user.role !== 'Admin' && team.manager.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove member from team
    team.members = team.members.filter(member => member.toString() !== req.params.memberId);
    await team.save();

    // Remove teamId from user
    await User.findByIdAndUpdate(req.params.memberId, { $unset: { teamId: 1 } });

    res.json({ message: 'Member removed successfully', team });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
