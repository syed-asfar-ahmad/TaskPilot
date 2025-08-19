const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NotificationService = require('../services/notificationService');


// Register new user
const register = async (req, res) => {
  const { name, email, password, position, gender, teamId } = req.body;
  const role = "Team Member";

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // If teamId is provided, verify the team exists
    if (teamId) {
      const Team = require('../models/Team');
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(400).json({ message: 'Selected team does not exist' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role, 
      position, 
      gender,
      teamId: teamId || null
    });
    await user.save();

    // If teamId is provided, add user to team members
    if (teamId) {
      const Team = require('../models/Team');
      await Team.findByIdAndUpdate(teamId, {
        $push: { members: user._id }
      });

      // Get team details and notify the team manager
      const team = await Team.findById(teamId).populate('manager', 'name email');
      if (team && team.manager) {
        await NotificationService.notifyTeamMemberJoined(team, user, team.manager);
      }
    }

    // Notify admin about new user registration
    const admin = await User.findOne({ role: 'Admin' });
    if (admin) {
      await NotificationService.notifyNewUserSignup(user, admin);
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { register, login };
