const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Create a notification
  static async createNotification(data) 
  {
    try {
      const notification = new Notification(data);
      await notification.save();
      return notification;
    } catch (error) {
      throw error;
    }
  }

  // Create task-related notifications
  static async notifyTaskCreated(task, creator) {
    try {
      // Notify the creator (manager) about task creation
      await this.createNotification({
        recipient: creator.id,
        sender: creator.id,
        type: 'TASK_CREATED',
        title: 'Task Created Successfully',
        message: `You successfully created task "${task.title}"`,
        relatedProject: task.project._id,
        relatedTask: task._id,
        priority: 'medium'
      });
      
      // Notify project manager (only if different from creator)
      if (task.project && task.project.projectManager) {
        const projectManagerId = typeof task.project.projectManager === 'string' 
          ? task.project.projectManager 
          : task.project.projectManager._id;

        if (projectManagerId.toString() !== creator.id) {
          await this.createNotification({
            recipient: projectManagerId,
            sender: creator.id,
            type: 'TASK_CREATED',
            title: 'New Task Created',
            message: `${creator.name} created a new task "${task.title}" in project "${task.project.name}"`,
            relatedProject: task.project._id,
            relatedTask: task._id,
            priority: 'medium'
          });
        }
      }

      // Notify assigned team members (only if different from creator)
      if (task.assignedTo && task.assignedTo.length > 0) {
        for (const assignee of task.assignedTo) {
          const assigneeId = typeof assignee === 'string' ? assignee : assignee._id;
          if (assigneeId.toString() !== creator.id) {
            await this.createNotification({
              recipient: assigneeId,
              sender: creator.id,
              type: 'TASK_CREATED',
              title: 'Task Assigned to You',
              message: `${creator.name} assigned you a new task "${task.title}"`,
              relatedProject: task.project._id,
              relatedTask: task._id,
              priority: 'high'
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static async notifyTaskUpdated(task, updater, changes) {
    try {
      // Notify the updater (manager or team member) about task update
      await this.createNotification({
        recipient: updater.id,
        sender: updater.id,
        type: 'TASK_UPDATED',
        title: 'Task Updated Successfully',
        message: `You successfully updated task "${task.title}"`,
        relatedProject: task.project._id,
        relatedTask: task._id,
        priority: 'medium'
      });
      // Notify project manager (only if different from updater)
      if (task.project && task.project.projectManager) {
        const projectManagerId = typeof task.project.projectManager === 'string' 
          ? task.project.projectManager 
          : task.project.projectManager._id;

        if (projectManagerId.toString() !== updater.id) {
          await this.createNotification({
            recipient: projectManagerId,
            sender: updater.id,
            type: 'TASK_UPDATED',
            title: 'Task Updated',
            message: `${updater.name} updated task "${task.title}"`,
            relatedProject: task.project._id,
            relatedTask: task._id,
            priority: 'medium'
          });
        }
      }

      // Notify assigned team members (only if different from updater)
      if (task.assignedTo && task.assignedTo.length > 0) {
        for (const assignee of task.assignedTo) {
          const assigneeId = typeof assignee === 'string' ? assignee : assignee._id;
          if (assigneeId.toString() !== updater.id) {
            await this.createNotification({
              recipient: assigneeId,
              sender: updater.id,
              type: 'TASK_UPDATED',
              title: 'Task Updated',
              message: `${updater.name} updated your assigned task "${task.title}"`,
              relatedProject: task.project._id,
              relatedTask: task._id,
              priority: 'medium'
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static async notifyTaskDeleted(task, deleter) {
    try {
      // Notify the deleter (manager) about task deletion
      await this.createNotification({
        recipient: deleter.id,
        sender: deleter.id,
        type: 'TASK_DELETED',
        title: 'Task Deleted Successfully',
        message: `You successfully deleted task "${task.title}"`,
        relatedProject: task.project._id,
        relatedTask: task._id,
        priority: 'high'
      });
      
      // Notify project manager (only if different from deleter)
      if (task.project && task.project.projectManager) {
        const projectManagerId = typeof task.project.projectManager === 'string' 
          ? task.project.projectManager 
          : task.project.projectManager._id;

        if (projectManagerId.toString() !== deleter.id) {
          await this.createNotification({
            recipient: projectManagerId,
            sender: deleter.id,
            type: 'TASK_DELETED',
            title: 'Task Deleted',
            message: `${deleter.name} deleted task "${task.title}"`,
            relatedProject: task.project._id,
            relatedTask: task._id,
            priority: 'high'
          });
        }
      }

      // Notify assigned team members (only if different from deleter)
      if (task.assignedTo && task.assignedTo.length > 0) {
        for (const assignee of task.assignedTo) {
          const assigneeId = typeof assignee === 'string' ? assignee : assignee._id;
          
          if (assigneeId.toString() !== deleter.id) {
            await this.createNotification({
              recipient: assigneeId,
              sender: deleter.id,
              type: 'TASK_DELETED',
              title: 'Task Deleted',
              message: `${deleter.name} deleted your assigned task "${task.title}"`,
              relatedProject: task.project._id,
              relatedTask: task._id,
              priority: 'high'
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static async notifyTaskCompleted(task, completer) {
    try {
      // Notify project manager
      if (task.project && task.project.projectManager) {
        const projectManagerId = typeof task.project.projectManager === 'string' 
          ? task.project.projectManager 
          : task.project.projectManager._id;

        if (projectManagerId !== completer.id) {
          await this.createNotification({
            recipient: projectManagerId,
            sender: completer.id,
            type: 'TASK_COMPLETED',
            title: 'Task Completed',
            message: `${completer.name} completed task "${task.title}"`,
            relatedProject: task.project._id,
            relatedTask: task._id,
            priority: 'medium'
          });
        }
      }
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create project-related notifications
  static async notifyProjectCreated(project, creator) {
    try {
      // Notify the creator (manager) about project creation
      await this.createNotification({
        recipient: creator.id,
        sender: creator.id,
        type: 'PROJECT_CREATED',
        title: 'Project Created Successfully',
        message: `You successfully created project "${project.name}"`,
        relatedProject: project._id,
        priority: 'high'
      });
      
      // Notify team members (only if different from creator)
      if (project.teamMembers && project.teamMembers.length > 0) {
        for (const member of project.teamMembers) {
          const memberId = typeof member === 'string' ? member : member._id;
          if (memberId.toString() !== creator.id) {
            await this.createNotification({
              recipient: memberId,
              sender: creator.id,
              type: 'PROJECT_CREATED',
              title: 'New Project Created',
              message: `${creator.name} created a new project "${project.name}"`,
              relatedProject: project._id,
              priority: 'high'
            });
          }
        }
      }
    } catch (error) {
      // Error handling without console logging
    }
  }

  static async notifyProjectUpdated(project, updater) {
    try {
      // Notify the updater (manager) about project update
      await this.createNotification({
        recipient: updater.id,
        sender: updater.id,
        type: 'PROJECT_UPDATED',
        title: 'Project Updated Successfully',
        message: `You successfully updated project "${project.name}"`,
        relatedProject: project._id,
        priority: 'medium'
      });
      
      // Notify team members (only if different from updater)
      if (project.teamMembers && project.teamMembers.length > 0) {
        for (const member of project.teamMembers) {
          const memberId = typeof member === 'string' ? member : member._id;
          if (memberId.toString() !== updater.id) {
            await this.createNotification({
              recipient: memberId,
              sender: updater.id,
              type: 'PROJECT_UPDATED',
              title: 'Project Updated',
              message: `${updater.name} updated project "${project.name}"`,
              relatedProject: project._id,
              priority: 'medium'
            });
          }
        }
      }
    } catch (error) {
      // Error handling without console logging
    }
  }

  static async notifyProjectDeleted(project, deleter) {
    try {
      // Notify the deleter (manager) about project deletion
      await this.createNotification({
        recipient: deleter.id,
        sender: deleter.id,
        type: 'PROJECT_DELETED',
        title: 'Project Deleted Successfully',
        message: `You successfully deleted project "${project.name}"`,
        priority: 'high'
      });
      
      // Notify team members (only if different from deleter)
      if (project.teamMembers && project.teamMembers.length > 0) {
        for (const member of project.teamMembers) {
          const memberId = typeof member === 'string' ? member : member._id;
          if (memberId.toString() !== deleter.id) {
            await this.createNotification({
              recipient: memberId,
              sender: deleter.id,
              type: 'PROJECT_DELETED',
              title: 'Project Deleted',
              message: `${deleter.name} deleted project "${project.name}"`,
              priority: 'high'
            });
          }
        }
      }
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create comment-related notifications
  static async notifyCommentAdded(comment, commenter, project, task = null) {
    try {
      // Notify project manager
      if (project.projectManager) {
        const projectManagerId = typeof project.projectManager === 'string' 
          ? project.projectManager 
          : project.projectManager._id;

        if (projectManagerId !== commenter.id) {
          await this.createNotification({
            recipient: projectManagerId,
            sender: commenter.id,
            type: 'COMMENT_ADDED',
            title: 'New Comment Added',
            message: `${commenter.name} added a comment on ${task ? `task "${task.title}"` : `project "${project.name}"`}`,
            relatedProject: project._id,
            relatedTask: task ? task._id : null,
            priority: 'low'
          });
        }
      } else {
        // No project manager found
      }

      // Notify team members (excluding commenter)
      if (project.teamMembers && project.teamMembers.length > 0) {
        for (const member of project.teamMembers) {
          const memberId = typeof member === 'string' ? member : member._id;
          if (memberId !== commenter.id && memberId !== project.projectManager) {
            await this.createNotification({
              recipient: memberId,
              sender: commenter.id,
              type: 'COMMENT_ADDED',
              title: 'New Comment Added',
              message: `${commenter.name} added a comment on ${task ? `task "${task.title}"` : `project "${project.name}"`}`,
              relatedProject: project._id,
              relatedTask: task ? task._id : null,
              priority: 'low'
            });
          }
        }
      } else {
        // No team members found
      }
      
    } catch (error) {
      // Error handling without console logging
    }
  }

  static async notifyCommentDeleted(comment, deleter, project, task = null) {
    try {
      // Notify project manager
      if (project.projectManager) {
        const projectManagerId = typeof project.projectManager === 'string' 
          ? project.projectManager 
          : project.projectManager._id;

        if (projectManagerId !== deleter.id) {
          await this.createNotification({
            recipient: projectManagerId,
            sender: deleter.id,
            type: 'COMMENT_DELETED',
            title: 'Comment Deleted',
            message: `${deleter.name} deleted a comment on ${task ? `task "${task.title}"` : `project "${project.name}"`}`,
            relatedProject: project._id,
            relatedTask: task ? task._id : null,
            priority: 'low'
          });
        }
      } else {
        // No project manager found
      }
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create attachment-related notifications
  static async notifyAttachmentAdded(attachment, uploader, project, task = null) {
    try {
      // Notify project manager
      if (project.projectManager) {
        const projectManagerId = typeof project.projectManager === 'string' 
          ? project.projectManager 
          : project.projectManager._id;

        if (projectManagerId !== uploader.id) {
          await this.createNotification({
            recipient: projectManagerId,
            sender: uploader.id,
            type: 'ATTACHMENT_ADDED',
            title: 'New Attachment Added',
            message: `${uploader.name} uploaded "${attachment.filename}" to ${task ? `task "${task.title}"` : `project "${project.name}"`}`,
            relatedProject: project._id,
            relatedTask: task ? task._id : null,
            priority: 'medium'
          });
        }
      } else {
        // No project manager found
      }

      // Notify team members
      if (project.teamMembers && project.teamMembers.length > 0) {
        for (const member of project.teamMembers) {
          const memberId = typeof member === 'string' ? member : member._id;
          if (memberId !== uploader.id && memberId !== project.projectManager) {
            await this.createNotification({
              recipient: memberId,
              sender: uploader.id,
              type: 'ATTACHMENT_ADDED',
              title: 'New Attachment Added',
              message: `${uploader.name} uploaded "${attachment.filename}" to ${task ? `task "${task.title}"` : `project "${project.name}"`}`,
              relatedProject: project._id,
              relatedTask: task ? task._id : null,
              priority: 'medium'
            });
          }
        }
      } else {
        // No team members found
      }
    } catch (error) {
      // Error handling without console logging
    }
  }

  static async notifyAttachmentDeleted(attachment, deleter, project, task = null) {
    try {
      // Notify project manager
      if (project.projectManager) {
        const projectManagerId = typeof project.projectManager === 'string' 
          ? project.projectManager 
          : project.projectManager._id;

        if (projectManagerId !== deleter.id) {
          await this.createNotification({
            recipient: projectManagerId,
            sender: deleter.id,
            type: 'ATTACHMENT_DELETED',
            title: 'Attachment Deleted',
            message: `${deleter.name} deleted "${attachment.filename}" from ${task ? `task "${task.title}"` : `project "${project.name}"`}`,
            relatedProject: project._id,
            relatedTask: task ? task._id : null,
            priority: 'medium'
          });
        }
      } else {
        // No project manager found
      }
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create profile update notification
  static async notifyProfileUpdated(user, updater) {
    try {
      // Notify the updater about profile update
      await this.createNotification({
        recipient: updater.id,
        sender: updater.id,
        type: 'PROFILE_UPDATED',
        title: 'Profile Updated Successfully',
        message: `You successfully updated your profile`,
        priority: 'low'
      });
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create team member addition notification
  static async notifyMemberAdded(member, adder, project, task = null) {
    try {
      // Notify the added member
      await this.createNotification({
        recipient: member.id,
        sender: adder.id,
        type: 'MEMBER_ADDED',
        title: 'Added to Project',
        message: `${adder.name} added you to ${task ? `task "${task.title}"` : `project "${project.name}"`}`,
        relatedProject: project._id,
        relatedTask: task ? task._id : null,
        priority: 'medium'
      });
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create team member removal notification
  static async notifyMemberRemoved(member, remover, project, task = null) {
    try {
      // Notify the removed member
      await this.createNotification({
        recipient: member.id,
        sender: remover.id,
        type: 'MEMBER_REMOVED',
        title: 'Removed from Project',
        message: `${remover.name} removed you from ${task ? `task "${task.title}"` : `project "${project.name}"`}`,
        relatedProject: project._id,
        relatedTask: task ? task._id : null,
        priority: 'medium'
      });
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create team creation notification
  static async notifyTeamCreated(team, creator) {
    try {
      // Notify the admin who created the team
      await this.createNotification({
        recipient: creator.id,
        sender: creator.id,
        type: 'TEAM_CREATED',
        title: 'Team Created Successfully',
        message: `You successfully created team "${team.name}"`,
        priority: 'medium'
      });
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create team member joined notification
  static async notifyTeamMemberJoined(team, member, manager) {
    try {
      // Notify the team manager when a new member joins
      await this.createNotification({
        recipient: manager.id,
        sender: member.id,
        type: 'TEAM_MEMBER_JOINED',
        title: 'New Team Member Joined',
        message: `${member.name} joined your team "${team.name}"`,
        priority: 'medium'
      });
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create project deleted by manager notification
  static async notifyProjectDeletedByManager(project, deleter, admin) {
    try {
      // Notify the admin when a manager deletes a project
      await this.createNotification({
        recipient: admin.id,
        sender: deleter.id,
        type: 'PROJECT_DELETED_BY_MANAGER',
        title: 'Project Deleted by Manager',
        message: `${deleter.name} deleted project "${project.name}"`,
        priority: 'high'
      });
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create new user signup notification
  static async notifyNewUserSignup(user, admin) {
    try {
      // Notify the admin when a new user signs up
      await this.createNotification({
        recipient: admin.id,
        sender: user.id,
        type: 'NEW_USER_SIGNUP',
        title: 'New User Registration',
        message: `${user.name} (${user.email}) has signed up as ${user.role}`,
        priority: 'medium'
      });
    } catch (error) {
      // Error handling without console logging
    }
  }

  // Create contact form submission notification
  static async notifyContactFormSubmitted(contact, admin) {
    try {
      // Notify the admin when a contact form is submitted
      await this.createNotification({
        recipient: admin._id,
        sender: admin._id,
        type: 'CONTACT_FORM_SUBMITTED',
        title: 'New Contact Form Submission',
        message: `${contact.name} (${contact.email}) submitted a contact form with subject: "${contact.subject}". Click to view details.`,
        relatedContact: contact._id,
        priority: 'high'
      });
    } catch (error) {
      // Silent error handling
    }
  }

  // Notify all chat participants (except sender) about a new message
  static async notifyNewMessage(message, sender, chat, participants) {
    try {
      for (const participant of participants) {
        const participantId = participant._id ? participant._id.toString() : participant.toString();
        if (participantId !== sender.id && participantId !== sender._id?.toString()) {
          await this.createNotification({
            recipient: participantId,
            sender: sender.id || sender._id,
            type: 'NEW_MESSAGE',
            title: `New message from ${sender.name}`,
            message: message.content,
            relatedChat: chat._id || chat.chatId,
            priority: 'low'
          });
        }
      }
    } catch (error) {
      // Error handling without console logging
    }
  }
}

module.exports = NotificationService;