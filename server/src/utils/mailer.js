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
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 5000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 5000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 8000),
    })
  : null;

const APP_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const brandHeader = `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
    <tr>
      <td style="vertical-align:middle;">
        <div style="height:46px;width:46px;border-radius:12px;background:#1A1035;color:#FFFFFF;font-weight:800;font-size:24px;line-height:46px;text-align:center;font-family:Arial,sans-serif;">N.</div>
      </td>
      <td style="vertical-align:middle;padding-left:12px;">
        <div style="font-size:22px;font-weight:800;color:#3C3489;line-height:1.1;font-family:Arial,sans-serif;">NudgeHQ</div>
        <div style="font-size:12px;font-weight:700;color:#5F5E5A;letter-spacing:0.08em;text-transform:uppercase;margin-top:3px;font-family:Arial,sans-serif;">Workspace onboarding</div>
      </td>
    </tr>
  </table>
`;

const sendNudgeMail = async (mailOptions, fallbackLink) => {
  if (!transporter) {
    console.info(`[NudgeHQ mail skipped] ${mailOptions.subject}: ${fallbackLink}`);
    return { skipped: true, previewLink: fallbackLink };
  }

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`[NudgeHQ mail failed] ${mailOptions.subject}: ${error.message}`);
    console.info(`[NudgeHQ mail fallback] ${mailOptions.subject}: ${fallbackLink}`);
    return { failed: true, previewLink: fallbackLink, error: error.message };
  }
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
      <div style="margin:0;background:#F7FAFF;padding:28px 12px;">
        <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #EEEDFE;border-radius:18px;padding:32px;color:#2C2C2A;font-family:Arial,sans-serif;">
          ${brandHeader}
          <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#2C2C2A;">Verify your NudgeHQ account</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#5F5E5A;">Hi ${name}, welcome to NudgeHQ. Confirm this email address to activate your workspace and continue company setup.</p>
          <p style="margin:26px 0;">
            <a href="${verifyLink}" style="padding:14px 22px;background-color:#7F77DD;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:800;display:inline-block;font-size:14px;">Verify Email</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#5F5E5A;">Button not working? Copy this link into your browser:</p>
          <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;color:#3C3489;">${verifyLink}</p>
          <div style="margin-top:28px;border-top:1px solid #EEEDFE;padding-top:18px;font-size:12px;line-height:1.6;color:#7A7974;">
            If this landed in Spam, mark it as "Not spam" so future NudgeHQ invites reach your inbox.
          </div>
        </div>
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
      <div style="font-family:Arial,sans-serif;padding:24px;color:#2C2C2A;">
        ${brandHeader}
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

export const sendContactQueryEmail = async ({ name, email, queryType, message }) => {
  const safeName = escapeHtml(String(name || '').trim());
  const safeEmail = escapeHtml(String(email || '').trim());
  const safeQueryType = escapeHtml(String(queryType || 'General query').trim());
  const safeMessage = escapeHtml(String(message || '').trim());

  const mailOptions = {
    from: `"NudgeHQ Contact" <${FROM_EMAIL}>`,
    to: FROM_EMAIL,
    replyTo: safeEmail,
    subject: `NudgeHQ query: ${safeQueryType} from ${safeName}`,
    html: `
      <div style="margin:0;background:#F7FAFF;padding:28px 12px;">
        <div style="max-width:620px;margin:0 auto;background:#FFFFFF;border:1px solid #EEEDFE;border-radius:18px;padding:32px;color:#2C2C2A;font-family:Arial,sans-serif;">
          ${brandHeader}
          <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#2C2C2A;">New Connect With Us query</h1>
          <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;margin:20px 0;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #EEEDFE;color:#5F5E5A;font-size:13px;font-weight:700;width:140px;">Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #EEEDFE;color:#2C2C2A;font-size:14px;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #EEEDFE;color:#5F5E5A;font-size:13px;font-weight:700;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #EEEDFE;color:#3C3489;font-size:14px;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #EEEDFE;color:#5F5E5A;font-size:13px;font-weight:700;">Query type</td>
              <td style="padding:10px 0;border-bottom:1px solid #EEEDFE;color:#2C2C2A;font-size:14px;">${safeQueryType}</td>
            </tr>
          </table>
          <div style="margin-top:18px;border:1px solid #EEEDFE;border-radius:12px;background:#FCFCFF;padding:18px;">
            <div style="font-size:12px;font-weight:800;color:#3C3489;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Message</div>
            <div style="font-size:15px;line-height:1.7;color:#2C2C2A;white-space:pre-wrap;">${safeMessage}</div>
          </div>
        </div>
      </div>
    `,
  };

  return sendNudgeMail(mailOptions, 'contact-query');
};
