const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');
const NotificationService = require('../services/notificationService');

// CREATE project
const createProject = async (req, res) => {
  const { name, description, deadline, teamMembers, status, projectManager } = req.body;
  
  try {
    // Get user details for notifications
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is a Manager, validate that they can only create projects within their team
    if (req.user.role === 'Manager') {
      const manager = await User.findById(req.user.id).populate('teamId');
      
      if (!manager.teamId) {
        return res.status(403).json({ error: 'Manager not assigned to any team' });
      }

      // Validate teamMembers: ensure all selected team members belong to the manager's team
      if (teamMembers && teamMembers.length > 0) {
        const membersInTeam = await User.find({ 
          _id: { $in: teamMembers }, 
          teamId: manager.teamId._id 
        });
        
        if (membersInTeam.length !== teamMembers.length) {
          return res.status(400).json({ error: 'All team members must belong to your team' });
        }
      }

      // For managers, set themselves as the project manager
      const projectData = {
        name,
        description,
        deadline,
        teamMembers,
        status,
        projectManager: req.user.id // Manager becomes the project manager
      };

      const project = new Project(projectData);
      await project.save();

      // Populate project for notifications
      const populatedProject = await Project.findById(project._id)
        .populate('teamMembers', 'name email')
        .populate('projectManager', 'name email');

      // Send notifications
      await NotificationService.notifyProjectCreated(populatedProject, user);

      // Send notifications to team members who were added
      if (teamMembers && teamMembers.length > 0) {
        for (const memberId of teamMembers) {
          const member = await User.findById(memberId);
          if (member) {
            await NotificationService.notifyMemberAdded(member, user, populatedProject);
          }
        }
      }

      res.status(201).json({ message: 'Project created', project });
    } else {
      // For Admin, use the provided projectManager or null
      const projectData = {
        name,
        description,
        deadline,
        teamMembers,
        status,
        projectManager: projectManager || null
      };

      const project = new Project(projectData);
      await project.save();

      // Populate project for notifications
      const populatedProject = await Project.findById(project._id)
        .populate('teamMembers', 'name email')
        .populate('projectManager', 'name email');

      // Send notifications
      await NotificationService.notifyProjectCreated(populatedProject, user);

      // Send notifications to team members who were added
      if (teamMembers && teamMembers.length > 0) {
        for (const memberId of teamMembers) {
          const member = await User.findById(memberId);
          if (member) {
            await NotificationService.notifyMemberAdded(member, user, populatedProject);
          }
        }
      }

      res.status(201).json({ message: 'Project created', project });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error creating project' });
  }
};

// GET all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('teamMembers', 'name email role')
      .populate('projectManager', 'name email role');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
};

// UPDATE project
const updateProject = async (req, res) => {
  const { id } = req.params;

  try {
    // Get user details for notifications
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Store original team members for comparison
    const originalTeamMembers = project.teamMembers || [];
    const newTeamMembers = req.body.teamMembers || [];

    const updated = await Project.findByIdAndUpdate(id, req.body, { new: true })
      .populate('teamMembers', 'name email role')
      .populate('projectManager', 'name email role');

    // Send notifications for project updates
    await NotificationService.notifyProjectUpdated(updated, user);

    // Check for team member changes and send notifications
    const addedMembers = newTeamMembers.filter(memberId => 
      !originalTeamMembers.includes(memberId)
    );
    const removedMembers = originalTeamMembers.filter(memberId => 
      !newTeamMembers.includes(memberId)
    );

    // Send notifications for added members
    for (const memberId of addedMembers) {
      const member = await User.findById(memberId);
      if (member) {
        await NotificationService.notifyMemberAdded(member, user, updated);
      }
    }

    // Send notifications for removed members
    for (const memberId of removedMembers) {
      const member = await User.findById(memberId);
      if (member) {
        await NotificationService.notifyMemberRemoved(member, user, updated);
      }
    }

    res.json({ message: 'Project updated', project: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error updating project' });
  }
};

// DELETE project
const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    // Get user details for notifications
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await Project.findById(id)
      .populate('teamMembers', 'name email')
      .populate('projectManager', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Send notifications before deleting
    await NotificationService.notifyProjectDeleted(project, user);

    // If a manager is deleting the project, notify the admin
    if (req.user.role === 'Manager') {
      // Find the admin (assuming there's only one admin or we want to notify the main admin)
      const admin = await User.findOne({ role: 'Admin' });
      if (admin) {
        await NotificationService.notifyProjectDeletedByManager(project, user, admin);
      }
    }

    await Project.findByIdAndDelete(id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting project' });
  }
};

// ADD COMMENT to a project
const addCommentToProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const comment = {
      text: req.body.text,
      author: req.user.id,
      createdAt: new Date()
    };

    project.comments.push(comment);
    await project.save();

    res.status(201).json({ message: 'Comment added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// GET comments for a project
const getProjectComments = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('comments.author', 'name email');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project.comments || []);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
};

// DELETE comment from a project (Admin or Manager)
const deleteProjectComment = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Find and remove the comment
    const commentIndex = project.comments.findIndex(comment => comment._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    project.comments.splice(commentIndex, 1);
    await project.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// GET team members of a specific project
const getProjectTeamMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('teamMembers', 'name email role profilePicture');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Add default avatars for users without profile pictures
    const teamMembersWithAvatars = project.teamMembers?.map(member => {
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=16a34a&color=ffffff&size=128`;
      return {
        _id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        profilePicture: member.profilePicture ? member.profilePicture : defaultAvatar
      };
    }) || [];

    res.json(teamMembersWithAvatars);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching team members' });
  }
};

// Get Projects (Team Members see only assigned ones)
const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'Team Member') {
      projects = await Project.find({ assignedTo: req.user.id });
    } else {
      projects = await Project.find();
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
};


module.exports = {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  addCommentToProject,
  getProjectComments,
  deleteProjectComment,
  getProjectTeamMembers,
  getProjects 
};
