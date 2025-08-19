const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalTeamMembers = await User.countDocuments({ role: 'Team Member' });

    const taskStatusBreakdown = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      totalProjects,
      totalTasks,
      totalTeamMembers,
      taskStatusBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

module.exports = { getDashboardStats };
