const jwt = require('jsonwebtoken');
const User = require("../models/User");
const Project = require("../models/Project");


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role
    };
    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check specific roles (e.g., Admin, Manager)
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. You do not have access.' });
    }
    next();
  };
};

// Middleware to check if manager is assigned to project
const checkManagerProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.project;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the user is a manager and is assigned to this project (as team member or project manager)
    const isAssignedToProject = project.teamMembers.some(memberId => 
      memberId.toString() === req.user.id
    );
    
    const isProjectManager = project.projectManager && 
      project.projectManager.toString() === req.user.id;

    if (req.user.role === 'Manager' && !isAssignedToProject && !isProjectManager) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check if manager or team member has access to task (via project)
const checkManagerTaskAccess = async (req, res, next) => {
  try {
    const Task = require("../models/Task");
    const taskId = req.params.id || req.params.taskId;
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Admins: always allowed
    if (req.user.role === 'Admin') {
      req.task = task;
      return next();
    }
    // Team Member: must be assigned to this task
    if (req.user.role === 'Team Member') {
      const isAssigned = Array.isArray(task.assignedTo) && task.assignedTo.some(u => u.toString() === req.user.id);
      if (!isAssigned) {
        return res.status(403).json({ message: 'You do not have access to this task' });
      }
      req.task = task;
      return next();
    }
    // Manager: must be assigned to project or be project manager
    const isAssignedToProject = task.project.teamMembers && task.project.teamMembers.some(memberId => memberId.toString() === req.user.id);
    const isProjectManager = task.project.projectManager && task.project.projectManager.toString() === req.user.id;
    if (req.user.role === 'Manager' && !isAssignedToProject && !isProjectManager) {
      return res.status(403).json({ message: 'You do not have access to this task' });
    }
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { verifyToken, checkRole, checkManagerProjectAccess, checkManagerTaskAccess };
