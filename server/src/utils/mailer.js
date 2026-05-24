import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const APP_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Send onboarding verification email
 */
export const sendVerificationEmail = async (email, name, token) => {
  const verifyLink = `${APP_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"NudgeHQ Onboarding" <no-reply@nudgehq.com>`,
    to: email,
    subject: 'Verify your NudgeHQ Workspace Account',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #2C2C2A;">
        <h2>Welcome to NudgeHQ, ${name}!</h2>
        <p>Please click the button below to verify your email address and activate your workspace:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyLink}" style="padding: 12px 24px; background-color: #7F77DD; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
        </p>
        <p>Or copy this link into your browser:</p>
        <p style="color: #7F77DD;">${verifyLink}</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 */
export const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${APP_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"NudgeHQ Security" <no-reply@nudgehq.com>`,
    to: email,
    subject: 'Reset your NudgeHQ Password',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #2C2C2A;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <p style="margin: 24px 0;">
          <a href="${resetLink}" style="padding: 12px 24px; background-color: #3C3489; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </p>
        <p>This link is valid for 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send employee magic link invitation email
 */
export const sendEmployeeInviteEmail = async (email, companyName, token) => {
  const inviteLink = `${APP_URL}/accept-invite?token=${token}`;

  const mailOptions = {
    from: `"NudgeHQ Workspaces" <no-reply@nudgehq.com>`,
    to: email,
    subject: `Join ${companyName} on NudgeHQ`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #2C2C2A;">
        <h2>You have been invited!</h2>
        <p>Your team at <strong>${companyName}</strong> has invited you to join their NudgeHQ workspace.</p>
        <p>Click the button below to set your password and access your employee check-in desk:</p>
        <p style="margin: 24px 0;">
          <a href="${inviteLink}" style="padding: 12px 24px; background-color: #1D9E75; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
        </p>
        <p>This link is valid for 7 days.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
