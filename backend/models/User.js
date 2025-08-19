const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Team Member'],
    default: 'Team Member'
  },

  bio: { type: String },

  dateOfBirth: { type: Date },

  position: { type: String },

  gender: { type: String, enum: ['Male', 'Female', 'Other'] },

  profilePicture: { type: String }, 

  // Team fields
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },

  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
