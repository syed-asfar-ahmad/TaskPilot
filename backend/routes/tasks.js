const express = require('express');
const router = express.Router();
const { verifyToken, checkRole, checkManagerTaskAccess } = require('../middleware/auth');
const {
  createTask,
  getAllTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addCommentToTask,
  getTasksByDueDate,
  deleteTaskComment,
} = require('../controllers/taskController');
const multer = require('multer');
const { put } = require('@vercel/blob');
const mongoose = require('mongoose');
const path = require('path');
const NotificationService = require('../services/notificationService');

// Configure multer for memory storage
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Create Task - Manager only
router.post('/', verifyToken, checkRole('Manager'), createTask);

// Get all tasks (Admin/Manager)
router.get('/', verifyToken, checkRole('Admin', 'Manager'), getAllTasks);

// Get tasks assigned to logged-in user
router.get('/my-tasks', verifyToken, getMyTasks);

// Get tasks by due date
router.get('/due-date', verifyToken, getTasksByDueDate);

// Get manager tasks
router.get('/manager-tasks', verifyToken, checkRole('Manager'), async (req, res) => {
  try {
    const Task = require('../models/Task');
    const Project = require('../models/Project');
    
    // Get projects managed by this manager
    const managedProjects = await Project.find({ projectManager: req.user.id });
    const projectIds = managedProjects.map(project => project._id);
    
    // Get tasks from managed projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('assignedTo', 'name email role');
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching manager tasks' });
  }
});

// Get Manager's Project-Specific Tasks
router.get('/manager-project/:projectId', verifyToken, checkRole('Manager'), async (req, res) => {
  try {
    const Task = require('../models/Task');
    const Project = require('../models/Project');
    
    // Check if manager is assigned to this project (as team member or project manager)
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const isAssigned = project.teamMembers?.includes(req.user.id) || 
                      project.projectManager?.toString() === req.user.id;
    
    if (!isAssigned) {
      return res.status(403).json({ error: 'Access denied. You are not assigned to this project.' });
    }
    
    // Get all tasks from this project
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('project', 'name');
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get project-specific tasks assigned to the team member
router.get('/project/:projectId/user', verifyToken, checkRole('Team Member'), async (req, res) => {
  try {
    const Task = require('../models/Task');
    const tasks = await Task.find({ 
      project: req.params.projectId, 
      assignedTo: req.user.id 
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name email');
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project tasks' });
  }
});

// Get Tasks for Calendar View - Any logged-in user
router.get('/calendar/tasks', verifyToken, getTasksByDueDate);

// Download Task Attachment - Any logged-in user
router.get('/:id/attachments/:attachmentId/download', verifyToken, async (req, res) => {
  const Task = require('../models/Task');
  const { id, attachmentId } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const attachment = task.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // If using Vercel Blob or external URL, redirect to the file URL
    if (attachment.path.startsWith('http')) {
      return res.redirect(attachment.path);
    }

    // If using local storage, serve the file (fallback)
    const filePath = path.join(__dirname, '..', attachment.path);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Determine MIME type based on file extension
    const extension = attachment.filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'bmp':
        contentType = 'image/bmp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
      case 'doc':
        contentType = 'application/msword';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: 'Download failed' });
  }
});

// Preview Task Attachment - Any logged-in user (without download headers)
router.get('/:id/attachments/:attachmentId/preview', verifyToken, async (req, res) => {
  const Task = require('../models/Task');
  const { id, attachmentId } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const attachment = task.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    // If using Vercel Blob or external URL, redirect to the file URL
    if (attachment.path.startsWith('http')) {
      return res.redirect(attachment.path);
    }

    // If using local storage, serve the file (fallback)
    const filePath = path.join(__dirname, '..', attachment.path);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Determine MIME type based on file extension
    const extension = attachment.filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'bmp':
        contentType = 'image/bmp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
      case 'doc':
        contentType = 'application/msword';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Set appropriate content type for preview (no download headers)
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: 'Preview failed' });
  }
});

// Delete Task Attachment - Manager only (if assigned to project)
router.delete('/:id/attachments/:attachmentId', verifyToken, checkRole('Manager'), checkManagerTaskAccess, async (req, res) => {
  const Task = require('../models/Task');
  const { id, attachmentId } = req.params;

  try {
    // Get user details for notifications
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const task = await Task.findById(id)
      .populate('project', 'name projectManager teamMembers')
      .populate('assignedTo', 'name email');
    
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const attachment = task.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    // Send notification before deleting
    await NotificationService.notifyAttachmentDeleted(attachment, user, task.project, task);

    // Remove the attachment from the array
    task.attachments.pull(attachmentId);
    await task.save();

    res.json({ message: 'Attachment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Get Task by ID - Any logged-in user
router.get('/:id', verifyToken, getTaskById);

// Update Task - Manager and Team Member (with different permissions handled in controller)
router.put('/:id', verifyToken, updateTask);

// Delete Task - Manager only (if assigned to project)
router.delete('/:id', verifyToken, checkRole('Manager'), checkManagerTaskAccess, deleteTask);

// Add Comment to Task - Any logged-in user (except Admin)
router.post('/:id/comments', verifyToken, (req, res, next) => {
  // Check if user is admin - restrict admin from commenting
  if (req.user.role === 'Admin') {
    return res.status(403).json({ error: 'Admin role cannot add comments to tasks' });
  }
  next();
}, addCommentToTask);

// Delete comment from task (Manager only)
router.delete('/:taskId/comments/:commentId', verifyToken, checkRole('Manager'), checkManagerTaskAccess, async (req, res) => {
  try {
    // Get user details for notifications
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const Task = require('../models/Task');
    const task = await Task.findById(req.params.taskId)
      .populate('project', 'name projectManager teamMembers')
      .populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Find the comment before deleting
    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Send notification before deleting
    await NotificationService.notifyCommentDeleted(comment, user, task.project, task);

    // Delete the comment
    await deleteTaskComment(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Upload File to Task - Any logged-in user (except Admin)
router.post('/:id/upload', verifyToken, memoryUpload.single('file'), async (req, res) => {
  const Task = require('../models/Task');

  try {
    // Check if user is admin - restrict admin from uploading files
    if (req.user.role === 'Admin') {
      return res.status(403).json({ error: 'Admin role cannot upload files to tasks' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get user details for notifications
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const task = await Task.findById(req.params.id)
      .populate('project', 'name projectManager teamMembers')
      .populate('assignedTo', 'name email');
    
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const filename = `task-${req.params.id}-${req.user.id}-${timestamp}-${req.file.originalname}`;

    const blob = await put(filename, req.file.buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const newAttachment = {
      _id: new mongoose.Types.ObjectId(),
      filename: req.file.originalname,
      path: blob.url,
      uploadedAt: new Date()
    };

    task.attachments.push(newAttachment);
    await task.save();
    
    // Send notification for new attachment
    await NotificationService.notifyAttachmentAdded(newAttachment, user, task.project, task);
    
    res.status(200).json({ message: 'File uploaded', file: newAttachment });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

module.exports = router;
