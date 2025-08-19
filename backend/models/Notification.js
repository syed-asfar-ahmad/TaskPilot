const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'TASK_CREATED',
      'TASK_UPDATED',
      'TASK_DELETED',
      'TASK_COMPLETED',
      'PROJECT_CREATED',
      'PROJECT_UPDATED',
      'PROJECT_DELETED',
      'PROJECT_COMPLETED',
      'COMMENT_ADDED',
      'COMMENT_DELETED',
      'ATTACHMENT_ADDED',
      'ATTACHMENT_DELETED',
      'PROFILE_UPDATED',
      'MEMBER_ADDED',
      'MEMBER_REMOVED',
      'ROLE_CHANGED',
      'TEAM_CREATED',
      'TEAM_MEMBER_JOINED',
      'PROJECT_DELETED_BY_MANAGER',
      'NEW_USER_SIGNUP',
      'CONTACT_FORM_SUBMITTED',
      'NEW_MESSAGE'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  relatedContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  relatedChat: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
