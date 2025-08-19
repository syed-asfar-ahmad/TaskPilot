const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  // Option 1: Gmail (most common)
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  
  // Option 2: Outlook/Hotmail
  outlook: {
    service: 'outlook',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  
  // Option 3: Custom SMTP (for any email provider)
  custom: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },

  // Option 4: SendGrid (Professional Email Service)
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey', // This is always 'apikey'
      pass: process.env.SENDGRID_API_KEY
    }
  }
};

// Get email service type from environment
const emailServiceType = process.env.EMAIL_SERVICE_TYPE || 'sendgrid';

// Create transporter based on configuration
let transporter;
try {
  transporter = nodemailer.createTransport(emailConfig[emailServiceType]);
} catch (error) {
  
  transporter = null;
}

// Professional Email Template for Password Reset
const getPasswordResetEmailTemplate = (resetUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - TaskPilot</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background-color: #f7fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }
        
        .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            padding: 50px 30px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .logo {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.95;
            font-weight: 300;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 50px 40px;
        }
        
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .description {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 40px;
            text-align: center;
            line-height: 1.7;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(22, 163, 74, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .reset-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .reset-button:hover::before {
            left: 100%;
        }
        
        .reset-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(22, 163, 74, 0.4);
        }
        
        .link-section {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 2px solid #bbf7d0;
            border-radius: 16px;
            padding: 30px;
            margin: 40px 0;
            position: relative;
            overflow: hidden;
        }
        
        .link-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #16a34a, #15803d);
        }
        
        .link-text {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 15px;
            text-align: center;
            font-weight: 500;
        }
        
        .reset-link {
            font-size: 13px;
            color: #16a34a;
            word-break: break-all;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #16a34a;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-weight: 500;
        }
        
        .footer {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 12px;
            font-weight: 500;
        }
        
        .security-note {
            font-size: 12px;
            color: #718096;
            font-style: italic;
            margin-top: 15px;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        
        .security-badge {
            display: inline-block;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin: 10px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .header, .content, .footer {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 32px;
            }
            
            .title {
                font-size: 24px;
            }
            
            .reset-button {
                padding: 16px 32px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TaskPilot</div>
            <div class="tagline">Project Management System</div>
        </div>
        
        <div class="content">
            <h1 class="title">Reset Your Password</h1>
            <p class="description">
                We received a request to reset your password for your TaskPilot account. 
                Click the button below to create a new password.
            </p>
            
            <div class="button-container">
                <a href="${resetUrl}" class="reset-button">
                    Reset Password
                </a>
            </div>
            
            <div class="link-section">
                <p class="link-text">
                    If the button doesn't work, copy and paste this link into your browser:
                </p>
                <div class="reset-link">${resetUrl}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
                <div class="security-badge">Secure Link</div>
                <p class="footer-text">
                    <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                </p>
                <p class="footer-text">
                    If you didn't request this password reset, please ignore this email.
                </p>
                <p class="security-note">
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Professional Email Template for Password Reset Success
const getPasswordResetSuccessEmailTemplate = (loginUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful - TaskPilot</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background-color: #f7fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }
        
        .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            padding: 50px 30px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .logo {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.95;
            font-weight: 300;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 50px 40px;
        }
        
        .success-icon {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .success-icon span {
            display: inline-block;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            border-radius: 50%;
            line-height: 80px;
            font-size: 40px;
            color: white;
            box-shadow: 0 8px 25px rgba(22, 163, 74, 0.3);
            position: relative;
        }
        
        .success-icon span::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, #16a34a, #15803d, #16a34a);
            border-radius: 50%;
            z-index: -1;
            opacity: 0.3;
        }
        
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .description {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 40px;
            text-align: center;
            line-height: 1.7;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(22, 163, 74, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .login-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .login-button:hover::before {
            left: 100%;
        }
        
        .login-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(22, 163, 74, 0.4);
        }
        
        .footer {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 12px;
            font-weight: 500;
        }
        
        .security-note {
            font-size: 12px;
            color: #718096;
            font-style: italic;
            margin-top: 15px;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        
        .success-badge {
            display: inline-block;
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin: 10px 0;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .feature-item {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            padding: 25px;
            border-radius: 16px;
            text-align: center;
            border: 2px solid #bbf7d0;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .feature-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #16a34a, #15803d);
        }
        
        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
            color: #16a34a;
        }
        
        .feature-text {
            font-size: 14px;
            color: #4a5568;
            font-weight: 500;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .header, .content, .footer {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 32px;
            }
            
            .title {
                font-size: 24px;
            }
            
            .login-button {
                padding: 16px 32px;
                font-size: 15px;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TaskPilot</div>
            <div class="tagline">Project Management System</div>
        </div>
        
        <div class="content">
            <div class="success-icon">
                <span>✓</span>
            </div>
            
            <h1 class="title">Password Reset Successful!</h1>
            <p class="description">
                Your password has been successfully reset. You can now log in to your TaskPilot account 
                with your new password and continue managing your projects.
            </p>
            
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">🔐</div>
                    <div class="feature-text">Secure Login</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">Project Analytics</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div class="feature-text">Team Collaboration</div>
                </div>
            </div>
            
            <div class="button-container">
                <a href="${loginUrl}" class="login-button">
                    Login to TaskPilot
                </a>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
                <div class="success-badge">Account Secured</div>
                <p class="footer-text">
                    <strong>Security Notice:</strong> If you didn't reset your password, 
                    please contact our support team immediately.
                </p>
                <p class="security-note">
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    // Check if transporter is configured
    if (!transporter) {
      return false;
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@taskpilot.com',
      to: email,
      subject: 'Reset Your Password - TaskPilot',
      html: getPasswordResetEmailTemplate(resetUrl)
    };

    const info = await transporter.sendMail(mailOptions);
    
    return true;
  } catch (error) {
    return false;
  }
};

// Send password reset success email
const sendPasswordResetSuccessEmail = async (email) => {
  try {
    // Check if transporter is configured
    if (!transporter) {
      return false;
    }

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@taskpilot.com',
      to: email,
      subject: 'Password Reset Successful - TaskPilot',
      html: getPasswordResetSuccessEmailTemplate(loginUrl)
    };

    const info = await transporter.sendMail(mailOptions);
    
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail
}; 