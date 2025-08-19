const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendPasswordResetEmail, sendPasswordResetSuccessEmail } = require('../services/emailService');

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL with production fallback
    let frontendUrl = process.env.FRONTEND_URL;
    
    // If no FRONTEND_URL set, try to detect production URL
    if (!frontendUrl) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        // Production fallback - replace with your actual frontend URL
        frontendUrl = 'https://your-frontend-domain.com';
      } else {
        frontendUrl = 'http://localhost:3000';
      }
    }
    
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Check if email service is configured
    const emailServiceType = process.env.EMAIL_SERVICE_TYPE || 'sendgrid';
    
    if (emailServiceType === 'none' || !process.env.SENDGRID_API_KEY) {
      // No email service configured - return token for manual sharing
      return res.status(200).json({ 
        message: 'Password reset link generated successfully.',
        resetUrl: resetUrl,
        note: 'Email service not configured. Share this link with the user manually.',
        token: resetToken // For development/testing only
      });
    }

    // Send email
    const emailSent = await sendPasswordResetEmail(email, resetToken, resetUrl);

    if (emailSent) {
      res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    } else {
      // Clear the token if email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
    }

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send success email (only if email service is configured)
    const emailServiceType = process.env.EMAIL_SERVICE_TYPE || 'sendgrid';
    if (emailServiceType !== 'none' && process.env.SENDGRID_API_KEY) {
      await sendPasswordResetSuccessEmail(user.email);
    }

    res.status(200).json({ message: 'Password has been reset successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify reset token (for frontend validation)
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.status(200).json({ message: 'Valid reset token' });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 