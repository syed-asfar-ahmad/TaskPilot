const Task = require('../models/Task');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

// Create Task
const createTask = async (req, res) => {
  const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

  try {
    // Get user details for notifications
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const task = new Task({
      title,
      description,
      project,
      assignedTo: assignedTo || [],
      status,
      priority,
      dueDate,
    });

    await task.save();

    // Populate task with project and assignedTo for notifications
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name projectManager')
      .populate('assignedTo', 'name email');

    // Send notifications
    await NotificationService.notifyTaskCreated(populatedTask, user);

    // Send notifications to team members who were assigned
    if (assignedTo && assignedTo.length > 0) {
      for (const memberId of assignedTo) {
        const member = await User.findById(memberId);
        if (member) {
          await NotificationService.notifyMemberAdded(member, user, populatedTask.project, populatedTask);
        }
      }
    }

    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    res.status(500).json({ error: 'Error creating task' });
  }
};

// Get all tasks (Admin/Manager)
const getAllTasks = async (req, res) => {
  try {
    const query = {};
    if (req.query.projectId) {
      query.project = req.query.projectId;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email role');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};


// Get tasks assigned to logged-in user
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('project', 'name')
      .populate('assignedTo', 'name'); 

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching your tasks' });
  }
};


const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email role')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name email',
        },
      });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching task' });
  }
};

// Update Task
const updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    assignedTo,
    attachments,
  } = req.body;

  try {
    // Get user details for notifications
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }


    // Check permissions based on user role
    if (user.role === 'Team Member') {
      // Team Member can only update status if assigned to this task
      const isAssigned = task.assignedTo.some(assignedUser => 
        assignedUser.toString() === user._id.toString()
      );
      
      if (!isAssigned) {
        return res.status(403).json({ error: 'You do not have permission to update this task.' });
      }
      
      // Only allow status update for team members
      if (Object.keys(req.body).length > 1 || !req.body.hasOwnProperty('status')) {
        return res.status(403).json({ error: 'Team members can only update task status.' });
      }
      
      // Update only status
      task.status = status || task.status;
      await task.save();
      
      // Populate task for notifications
      const populatedTask = await Task.findById(task._id)
        .populate('project', 'name projectManager')
        .populate('assignedTo', 'name email');
      
      // Send notification for status change
      await NotificationService.notifyTaskUpdated(populatedTask, user, { status: { from: task.status, to: status } });
      
      return res.json(task);
    } else if (user.role !== 'Manager') {
      return res.status(403).json({ error: 'You do not have permission to update this task.' });
    }

    // Manager can update all fields
    // Store original values for comparison
    const originalStatus = task.status;
    const originalAssignedTo = task.assignedTo;

    // Update basic fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;

    // Attachments (overwrite only if present)
    if (attachments && Array.isArray(attachments)) {
      task.attachments = attachments; // must be array of { filename, path }
    }

    await task.save();

    // Populate task for notifications
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name projectManager')
      .populate('assignedTo', 'name email');

    // Send notifications for task updates
    const changes = {
      status: status !== originalStatus ? { from: originalStatus, to: status } : null,
      assignedTo: JSON.stringify(assignedTo) !== JSON.stringify(originalAssignedTo) ? { from: originalAssignedTo, to: assignedTo } : null
    };

    await NotificationService.notifyTaskUpdated(populatedTask, user, changes);

    // Send completion notification if status changed to completed
    if (status === 'Completed' && originalStatus !== 'Completed') {
      await NotificationService.notifyTaskCompleted(populatedTask, user);
    }

    // Check for team member changes and send notifications
    const addedMembers = assignedTo ? assignedTo.filter(memberId => 
      !originalAssignedTo.includes(memberId)
    ) : [];
    const removedMembers = originalAssignedTo.filter(memberId => 
      !assignedTo.includes(memberId)
    );

    // Send notifications for added members
    for (const memberId of addedMembers) {
      const member = await User.findById(memberId);
      if (member) {
        await NotificationService.notifyMemberAdded(member, user, populatedTask.project, populatedTask);
      }
    }

    // Send notifications for removed members
    for (const memberId of removedMembers) {
      const member = await User.findById(memberId);
      if (member) {
        await NotificationService.notifyMemberRemoved(member, user, populatedTask.project, populatedTask);
      }
    }

    res.json({ message: "Task updated", task });
  } catch (err) {
    res.status(500).json({ error: "Error updating task" });
  }
};


// Delete Task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Get user details for notifications
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const task = await Task.findById(id)
      .populate('project', 'name projectManager')
      .populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Send notifications before deleting
    await NotificationService.notifyTaskDeleted(task, user);

    await Task.findByIdAndDelete(id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task' });
  }
};

const addCommentToTask = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const newComment = {
      text,
      author: req.user.id,
      createdAt: new Date(),
    };

    task.comments.push(newComment);
    await task.save();

    const updatedTask = await Task.findById(id).populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'name email',
      },
    });

    const lastComment = updatedTask.comments.at(-1);

    // Send notification for new comment
    const populatedTask = await Task.findById(id)
      .populate('project', 'name projectManager teamMembers')
      .populate('assignedTo', 'name email');

    await NotificationService.notifyCommentAdded(lastComment, req.user, populatedTask.project, populatedTask);

    res.status(200).json(lastComment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

const getTasksByDueDate = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'Team Member') {
      // Show only tasks assigned to the logged-in Team Member
      tasks = await Task.find({ assignedTo: req.user.id }, 'title dueDate status')
        .populate('project', 'name')
        .populate('assignedTo', 'name');
    } else {
      // Admin/Manager can see all tasks
      tasks = await Task.find({}, 'title dueDate status')
        .populate('project', 'name')
        .populate('assignedTo', 'name');
    }

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks for calendar' });
  }
};

const getMyProjectTasks = async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await Task.find({
      project: projectId,
      assignedTo: req.user.id,
    }).populate('assignedTo', 'name');

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your assigned tasks for this project' });
  }
};

const uploadTaskFile = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const fileData = {
      filename: req.file.originalname,
      path: req.file.path,
    };

    task.attachments.push(fileData);
    await task.save();

    res.status(200).json({ message: 'File uploaded and attached', file: fileData });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading file' });
  }
};

// DELETE comment from a task (Admin or Manager)
const deleteTaskComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Find and remove the comment
    const commentIndex = task.comments.findIndex(comment => comment._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    task.comments.splice(commentIndex, 1);
    await task.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addCommentToTask,
  deleteTaskComment,
  getTasksByDueDate,
  getMyProjectTasks,
  uploadTaskFile
};
