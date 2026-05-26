import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const hasSmtpConfig = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const FROM_EMAIL = process.env.MAIL_FROM || 'hello.nudgehq@gmail.com';

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const APP_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const sendNudgeMail = async (mailOptions, fallbackLink) => {
  if (!transporter) {
    console.info(`[NudgeHQ mail skipped] ${mailOptions.subject}: ${fallbackLink}`);
    return { skipped: true, previewLink: fallbackLink };
  }

  return transporter.sendMail(mailOptions);
};

/**
 * Send onboarding verification email
 */
export const sendVerificationEmail = async (email, name, token) => {
  const verifyLink = `${APP_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"NudgeHQ Onboarding" <${FROM_EMAIL}>`,
    to: email,
    subject: 'Verify your NudgeHQ account',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #2C2C2A;">
        <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;">
          <div style="height:42px;width:42px;border-radius:10px;background:#1A1035;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;">N.</div>
          <strong style="font-size:20px;color:#3C3489;">NudgeHQ</strong>
        </div>
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

  return sendNudgeMail(mailOptions, verifyLink);
};

/**
 * Send password reset email
 */
export const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${APP_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"NudgeHQ Security" <${FROM_EMAIL}>`,
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

  return sendNudgeMail(mailOptions, resetLink);
};

/**
 * Send employee magic link invitation email
 */
export const sendEmployeeInviteEmail = async (email, companyName, token) => {
  const inviteLink = `${APP_URL}/set-password?token=${token}`;

  const mailOptions = {
    from: `"NudgeHQ Workspaces" <${FROM_EMAIL}>`,
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

  return sendNudgeMail(mailOptions, inviteLink);
};

export const sendWorkspaceInviteEmail = async ({ email, adminName, companyName, token }) => {
  const inviteLink = `${APP_URL}/set-password?token=${token}`;

  const mailOptions = {
    from: `"NudgeHQ Workspaces" <${FROM_EMAIL}>`,
    to: email,
    subject: `${adminName} invited you to NudgeHQ`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #2C2C2A;">
        <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;">
          <div style="height:42px;width:42px;border-radius:10px;background:#1A1035;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;">N.</div>
          <strong style="font-size:20px;color:#3C3489;">NudgeHQ</strong>
        </div>
        <h2>Join ${companyName} workspace</h2>
        <p>${adminName} invited you to join <strong>${companyName}</strong> on NudgeHQ.</p>
        <p style="margin: 24px 0;">
          <a href="${inviteLink}" style="padding: 12px 24px; background-color: #7F77DD; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept invite & set password</a>
        </p>
        <p>This invite link is valid for 7 days.</p>
        <p style="color:#7F77DD;">${inviteLink}</p>
      </div>
    `,
  };

  return sendNudgeMail(mailOptions, inviteLink);
};
