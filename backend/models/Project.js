const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  status: {
    type: String,
    enum: ['Not Started', 'Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },

  deadline: {
    type: Date
  },

  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Added Comments Field
  comments: [
    {
      text: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Added Attachments Field
  attachments: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId
      },
      filename: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, { timestamps: true });

// Pre-delete hook to automatically delete associated tasks
projectSchema.pre('findOneAndDelete', async function(next) {
  const projectId = this.getQuery()._id;
  if (projectId) {
    const Task = require('./Task');
    await Task.deleteMany({ project: projectId });
  }
  next();
});

projectSchema.pre('deleteOne', async function(next) {
  const projectId = this.getQuery()._id;
  if (projectId) {
    const Task = require('./Task');
    await Task.deleteMany({ project: projectId });
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
