import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { sendVerificationEmail, sendResetPasswordEmail, sendWorkspaceInviteEmail } from '../utils/mailer.js';
import { isValidPhoneNumber, sendWhatsAppWelcome } from '../services/whatsapp.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_nudgehq_jwt_key_change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const VALID_ROLES = ['employee', 'manager', 'hr', 'admin'];

const dashboardPathForRole = (role) => ({
  admin: '/dashboard/admin',
  hr: '/dashboard/hr',
  manager: '/dashboard/manager',
  employee: '/dashboard/employee'
}[role] || '/dashboard/employee');

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const isSupabaseConnectionError = (error) => (
  error?.message?.includes('fetch failed') ||
  error?.name === 'TypeError'
);

const isMissingOrgSchema = (error) => (
  error?.code === '42P01' ||
  error?.code === '42703' ||
  /organizations|organization_id|schema cache|does not exist/i.test(error?.message || '')
);

const isMissingInviteLinkSchema = (error) => (
  error?.code === '42P01' ||
  error?.code === 'PGRST205' ||
  /invite_links.*schema cache|invite_links.*does not exist/i.test(error?.message || '')
);

const compactPayload = (payload) => Object.fromEntries(
  Object.entries(payload).filter(([, value]) => value !== undefined)
);

const insertWithOptionalOrganization = async (table, payload) => {
  const { data, error } = await supabase
    .from(table)
    .insert([compactPayload(payload)])
    .select()
    .single();

  if (!error) return { data };

  if (!isMissingOrgSchema(error) || payload.organization_id === undefined) {
    throw error;
  }

  const { organization_id, ...fallbackPayload } = payload;
  const fallback = await supabase
    .from(table)
    .insert([compactPayload(fallbackPayload)])
    .select()
    .single();

  if (fallback.error) throw fallback.error;
  return { data: fallback.data };
};

/**
 * Helper to generate email verification token and record
 */
const createVerificationToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const { error } = await supabase
    .from('email_verifications')
    .insert([{ user_id: userId, token, expires_at: expiresAt }]);

  if (error) throw error;
  return token;
};

/**
 * Signup Controller: Registers a new user (admin or employee)
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Validate role
    const userRole = role || 'employee';
    if (!VALID_ROLES.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be employee, manager, hr, or admin.'
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into Supabase (unverified by default)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: normalizedEmail,
          password_hash: passwordHash,
          role: userRole,
          department_id: department_id || null,
          is_verified: false
        }
      ])
      .select('id, name, email, role, department_id, organization_id, created_at')
      .single();

    if (insertError) throw insertError;

    // Create verification token and send email
    const verificationToken = await createVerificationToken(newUser.id);
    await sendVerificationEmail(normalizedEmail, name, verificationToken);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: isSupabaseConnectionError(error)
        ? 'Supabase is not reachable. Check environment configurations.'
        : 'Failed to register user.',
      error: error.message
    });
  }
};

/**
 * Company onboarding: creates an organization, default department, and unverified admin user.
 * POST /auth/company-signup
 */
export const companySignup = async (req, res) => {
  try {
    const { company_name, admin_name, name, email, password, agree_terms } = req.body;
    const adminName = admin_name || name;
    const normalizedEmail = email.toLowerCase().trim();

    if (agree_terms === false) {
      return res.status(400).json({ success: false, message: 'Please agree to the Terms & Conditions before creating a workspace.' });
    }

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.'
      });
    }

    let organization = null;
    let organizationSchemaReady = true;

    let authUserId = null;
    try {
      const authResult = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: false,
        user_metadata: { name: adminName, company_name }
      });
      authUserId = authResult.data?.user?.id || null;
    } catch (authError) {
      console.warn('Supabase Auth createUser skipped/fallback:', authError.message);
    }

    const orgInsert = {
      name: company_name,
      plan: 'free_trial',
      trial_ends_at: addDays(14)
    };

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([orgInsert])
      .select('id, name, plan, trial_ends_at, created_at')
      .single();

    if (orgError) {
      if (!isMissingOrgSchema(orgError)) throw orgError;
      organizationSchemaReady = false;
    } else {
      organization = orgData;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: adminUser } = await insertWithOptionalOrganization('users', {
      id: authUserId || undefined,
      name: adminName,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'admin',
      department_id: null,
      organization_id: organization?.id,
      company_id: organization?.id,
      onboarding_complete: false,
      is_verified: false
    });

    if (organization?.id) {
      await supabase
        .from('organizations')
        .update({ owner_id: adminUser.id })
        .eq('id', organization.id);
    }

    // Create verification token and send email
    const verificationToken = await createVerificationToken(adminUser.id);
    sendVerificationEmail(normalizedEmail, adminName, verificationToken)
      .catch((mailError) => console.error('Company signup verification email failed:', mailError.message));

    return res.status(201).json({
      success: true,
      message: organizationSchemaReady
        ? 'Company workspace registered. Please check your email to verify and activate your account.'
        : 'Admin account created. Run schema migrations to enable company isolation records.',
      verification_email: normalizedEmail,
      organization,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      },
      organization_schema_ready: organizationSchemaReady
    });
  } catch (error) {
    console.error('Company signup error:', error);
    return res.status(500).json({
      success: false,
      message: isSupabaseConnectionError(error)
        ? 'Supabase is not reachable. Check backend environment variables.'
        : 'Failed to create company workspace.',
      error: error.message
    });
  }
};

export const googleOAuthUrl = async (req, res) => {
  try {
    const redirectTo = `${CLIENT_URL}/oauth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
    return res.status(200).json({ success: true, url: data.url });
  } catch (error) {
    console.error('Google OAuth URL error:', error);
    return res.status(500).json({ success: false, message: 'Could not start Google sign-in.', error: error.message });
  }
};

export const googleOAuthCallback = async (req, res) => {
  try {
    const { code, access_token, company_name } = req.body;
    if (!code && !access_token) {
      return res.status(400).json({ success: false, message: 'Google authorization response is required.' });
    }

    let googleUser = null;
    if (access_token) {
      const { data: userData, error: userError } = await supabase.auth.getUser(access_token);
      if (userError) throw userError;
      googleUser = userData?.user;
    } else {
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) throw sessionError;
      googleUser = sessionData?.user;
    }
    const normalizedEmail = googleUser?.email?.toLowerCase().trim();
    if (!googleUser || !normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Google account did not return an email address.' });
    }

    const displayName = googleUser.user_metadata?.full_name || googleUser.user_metadata?.name || normalizedEmail.split('@')[0];

    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id, name, email, password_hash, role, department_id, organization_id, company_id, onboarding_complete, is_verified, created_at, organizations!users_company_id_fkey(id, name, plan, trial_ends_at, plan_expires_at)')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (existingError) throw existingError;

    let user = existingUser;
    if (user && !user.is_verified) {
      await supabase.from('users').update({ is_verified: true }).eq('id', user.id);
      user = { ...user, is_verified: true };
    }

    if (!user) {
      const orgName = company_name?.trim() || `${displayName}'s Workspace`;
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name: orgName, plan: 'free_trial', trial_ends_at: addDays(14) }])
        .select('id, name, plan, trial_ends_at, created_at')
        .single();
      if (orgError) throw orgError;

      const passwordHash = await bcrypt.hash(`google-oauth:${googleUser.id}:${Date.now()}`, 10);
      const inserted = await insertWithOptionalOrganization('users', {
        id: googleUser.id,
        name: displayName,
        email: normalizedEmail,
        password_hash: passwordHash,
        role: 'admin',
        department_id: null,
        organization_id: organization.id,
        company_id: organization.id,
        onboarding_complete: false,
        is_verified: true
      });

      await supabase.from('organizations').update({ owner_id: inserted.data.id }).eq('id', organization.id);
      user = { ...inserted.data, organizations: organization };
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        organization_id: user.organization_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password_hash, ...safeUserData } = user;
    const redirectTo = ['admin', 'hr'].includes(safeUserData.role) && !safeUserData.onboarding_complete
      ? '/onboarding'
      : dashboardPathForRole(safeUserData.role);

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful.',
      token,
      user: safeUserData,
      redirect_to: redirectTo
    });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.status(500).json({ success: false, message: 'Could not complete Google sign-in.', error: error.message });
  }
};

/**
 * Login Controller: Authenticates user credentials and returns JWT (tenant isolated)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user details from database
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, password_hash, role, department_id, organization_id, company_id, onboarding_complete, is_verified, created_at, organizations!users_company_id_fkey(id, name, plan, trial_ends_at, plan_expires_at)')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Enforce email verification check
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.'
      });
    }

    // Generate JWT token containing the tenant organization ID claim
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        organization_id: user.organization_id // <-- CRITICAL CLAIM
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password_hash from return response
    const { password_hash, ...safeUserData } = user;
    const dashboardPath = dashboardPathForRole(user.role);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: safeUserData,
      redirect_to: dashboardPath
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: isSupabaseConnectionError(error)
        ? 'Supabase is not reachable. Check configurations.'
        : 'Failed to authenticate user.',
      error: error.message
    });
  }
};

/**
 * Get Profile: Returns authenticated user payload
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role, department_id, organization_id, created_at, departments(name)')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile data.',
      error: error.message
    });
  }
};

/**
 * Verify Email Verification Token
 * GET /auth/verify-email
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    // Fetch token details
    const { data: record, error: tokenError } = await supabase
      .from('email_verifications')
      .select('id, user_id, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (tokenError) throw tokenError;

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid verification token.' });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, message: 'Verification link has expired.' });
    }

    // Activate user
    const { error: userError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', record.user_id);

    if (userError) throw userError;

    // Delete token record so it cannot be reused
    await supabase.from('email_verifications').delete().eq('id', record.id);

    const { data: verifiedUser } = await supabase
      .from('users')
      .select('id, name, email, role, department_id, organization_id, company_id, onboarding_complete, organizations!users_company_id_fkey(id, name, plan, trial_ends_at, plan_expires_at)')
      .eq('id', record.user_id)
      .single();

    const jwtToken = verifiedUser ? jwt.sign(
      {
        id: verifiedUser.id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        role: verifiedUser.role,
        department_id: verifiedUser.department_id,
        organization_id: verifiedUser.organization_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    ) : null;

    const redirectTo = ['admin', 'hr'].includes(verifiedUser?.role) && !verifiedUser?.onboarding_complete
      ? '/onboarding'
      : '/choose-plan';

    if (req.headers.accept?.includes('text/html')) {
      return res.redirect(`${CLIENT_URL}${redirectTo}?verified=1`);
    }

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully. Continue setting up your workspace.',
      redirect_to: redirectTo,
      token: jwtToken,
      user: verifiedUser
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify email.' });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, is_verified')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(200).json({ success: true, message: 'If this email exists, a verification email has been sent.' });
    if (user.is_verified) return res.status(200).json({ success: true, message: 'This email is already verified.' });

    const verificationToken = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, user.name, verificationToken);
    return res.status(200).json({ success: true, message: 'Verification email sent.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to resend verification email.' });
  }
};

/**
 * Forgot Password: Create reset link and email it
 * POST /auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const { data: user, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (checkError) throw checkError;

    // Avoid indicating email existence (always return positive generic response)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email matches an active account, a password reset link has been sent.'
      });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Store reset request
    const { error: resetError } = await supabase
      .from('password_resets')
      .insert([{ email: normalizedEmail, token, expires_at: expiresAt }]);

    if (resetError) throw resetError;

    // Send email
    await sendResetPasswordEmail(normalizedEmail, token);

    return res.status(200).json({
      success: true,
      message: 'If the email matches an active account, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to request password reset.' });
  }
};

/**
 * Reset Password using token
 * POST /auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    // Fetch token
    const { data: record, error: tokenError } = await supabase
      .from('password_resets')
      .select('id, email, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (tokenError) throw tokenError;

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset link.' });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, message: 'Password reset link has expired.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password and set verified (failsafe)
    const { error: userError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, is_verified: true })
      .eq('email', record.email);

    if (userError) throw userError;

    // Remove token record
    await supabase.from('password_resets').delete().eq('id', record.id);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

/**
 * Get Invitation Details
 * GET /auth/invite-status
 */
export const getInviteStatus = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Invitation token is required.' });
    }

    const uuidLikeToken = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
    if (!uuidLikeToken) {
      return res.status(400).json({
        success: false,
        message: 'This invite link is from an older email. Please ask your admin to send a fresh invite.'
      });
    }

    const { data: invitation, error } = await supabase
      .from('employee_invitations')
      .select('id, email, name, phone_number, role, department_id, organization_id, company_id, status, expires_at, organizations!employee_invitations_organization_id_fkey(name)')
      .eq('token', token)
      .maybeSingle();

    if (error) throw error;

    if (!invitation || invitation.status !== 'pending' || new Date() > new Date(invitation.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'This invitation is invalid, expired, or has already been used.'
      });
    }

    const organizationId = invitation.company_id || invitation.organization_id;
    let organization = null;

    if (organizationId) {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('name, logo_url')
        .eq('id', organizationId)
        .maybeSingle();

      if (orgError) console.warn('Invite organization lookup failed:', orgError.message);
      organization = orgData || null;
    }

    return res.status(200).json({
      success: true,
      invitation: {
        ...invitation,
        organizations: organization
      }
    });
  } catch (error) {
    console.error('Get invite status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to check invitation status.' });
  }
};

/**
 * Accept Magic Link invitation and register employee account
 * POST /auth/accept-invite
 */
export const acceptInvite = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({ success: false, message: 'Token, name, and password are required.' });
    }

    const uuidLikeToken = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
    if (!uuidLikeToken) {
      return res.status(400).json({
        success: false,
        message: 'This invite link is from an older email. Please ask your admin to send a fresh invite.'
      });
    }

    // Fetch invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('employee_invitations')
      .select('id, email, name, role, department_id, organization_id, company_id, status, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (inviteError) throw inviteError;

    if (!invitation || invitation.status !== 'pending' || new Date() > new Date(invitation.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'This invitation is invalid, expired, or has already been used.'
      });
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const organizationId = invitation.organization_id || invitation.company_id;
    const companyId = invitation.company_id || invitation.organization_id;

    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id, name, email, role, organization_id, company_id')
      .eq('email', invitation.email)
      .maybeSingle();

    if (existingUserError) throw existingUserError;

    let newUser = null;

    if (existingUser) {
      const { data: updatedUser, error: updateUserError } = await supabase
        .from('users')
        .update(compactPayload({
          name,
          password_hash: passwordHash,
          role: invitation.role || 'employee',
          organization_id: organizationId,
          company_id: companyId,
          department_id: invitation.department_id || null,
          phone_number: invitation.phone_number || null,
          onboarding_complete: true,
          is_verified: true
        }))
        .eq('id', existingUser.id)
        .select('id, name, email, phone_number, role, organization_id, company_id, department_id')
        .single();

      if (updateUserError) throw updateUserError;
      newUser = updatedUser;
    } else {
      let authUserId = null;
      try {
        const authResult = await supabase.auth.admin.createUser({
          email: invitation.email,
          password,
          email_confirm: true,
          user_metadata: { name }
        });
        authUserId = authResult.data?.user?.id || null;
      } catch (authError) {
        console.warn('Supabase Auth invited user create skipped/fallback:', authError.message);
      }

      // Create user and link to company automatically
      const { data: insertedUser, error: userError } = await supabase
        .from('users')
        .insert([
          compactPayload({
            id: authUserId || undefined,
            name,
            email: invitation.email,
            password_hash: passwordHash,
            role: invitation.role || 'employee',
            organization_id: organizationId,
            company_id: companyId,
            department_id: invitation.department_id || null,
            phone_number: invitation.phone_number || null,
            onboarding_complete: true,
            is_verified: true // Magic link serves as verification
          })
        ])
        .select('id, name, email, phone_number, role, organization_id, company_id, department_id')
        .single();

      if (userError) throw userError;
      newUser = insertedUser;
    }

    // Set invitation status to accepted
    await supabase
      .from('employee_invitations')
      .update({ status: 'accepted', user_id: newUser.id, accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (newUser.phone_number) {
      try {
        await sendWhatsAppWelcome({
          phone: newUser.phone_number,
          name: newUser.name,
          companyName: invitation.organizations?.name || 'your company',
        });
      } catch (whatsappError) {
        console.warn('WhatsApp welcome skipped:', whatsappError.message);
      }
    }

    // Generate login token directly
    const jwtToken = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department_id: newUser.department_id || null,
        organization_id: newUser.organization_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Invitation accepted. Welcome to the company workspace.',
      token: jwtToken,
      user: newUser,
      redirect_to: dashboardPathForRole(newUser.role)
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    return res.status(500).json({ success: false, message: 'Failed to accept invitation.' });
  }
};

export const joinByInviteCode = async (req, res) => {
  try {
    const { code, name, email, password } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Invite code is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { data: link, error: linkError } = await supabase
      .from('invite_links')
      .select('id, code, company_id, organization_id, expires_at, max_uses, uses_count, is_active, organizations!invite_links_company_id_fkey(name, logo_url)')
      .eq('code', code)
      .maybeSingle();

    if (linkError) throw linkError;
    if (!link || !link.is_active || new Date() > new Date(link.expires_at) || link.uses_count >= link.max_uses) {
      return res.status(400).json({ success: false, message: 'This invite link has expired. Ask your admin for a new one.' });
    }

    let authUserId = null;
    try {
      const authResult = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { name }
      });
      authUserId = authResult.data?.user?.id || null;
    } catch (authError) {
      console.warn('Supabase Auth join user create skipped/fallback:', authError.message);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const companyId = link.company_id || link.organization_id;
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([compactPayload({ id: authUserId || undefined, name, email: normalizedEmail, password_hash: passwordHash, role: 'employee', organization_id: companyId, company_id: companyId, is_verified: true, onboarding_complete: true })])
      .select('id, name, email, role, organization_id, company_id, department_id')
      .single();

    if (userError) throw userError;

    await supabase
      .from('invite_links')
      .update({ uses_count: link.uses_count + 1 })
      .eq('id', link.id);

    const jwtToken = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, department_id: newUser.department_id || null, organization_id: newUser.organization_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({ success: true, token: jwtToken, user: newUser, redirect_to: '/dashboard/employee' });
  } catch (error) {
    console.error('Join by invite code error:', error);
    if (isMissingInviteLinkSchema(error)) {
      return res.status(503).json({ success: false, message: 'Magic invite links are not configured yet. Please run the latest Supabase schema.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to join workspace.', error: error.message });
  }
};

export const getInviteLinkStatus = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Invite code is required.' });
    }

    const { data: link, error } = await supabase
      .from('invite_links')
      .select('code, expires_at, max_uses, uses_count, is_active, organizations!invite_links_company_id_fkey(name, logo_url)')
      .eq('code', code)
      .maybeSingle();

    if (error) throw error;
    if (!link || !link.is_active || new Date() > new Date(link.expires_at) || link.uses_count >= link.max_uses) {
      return res.status(400).json({ success: false, message: 'This invite link has expired. Ask your admin for a new one.' });
    }

    return res.status(200).json({ success: true, invite: link });
  } catch (error) {
    console.error('Invite code status error:', error);
    if (isMissingInviteLinkSchema(error)) {
      return res.status(503).json({ success: false, message: 'Magic invite links are not configured yet. Please run the latest Supabase schema.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to check invite link.' });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const adminId = req.user.id;
    const { company = {}, departments = [], employees = [], generate_invite_link = true } = req.body;

    const { error: orgError } = await supabase
      .from('organizations')
      .update(compactPayload({
        name: company.name || undefined,
        industry: company.industry || null,
        size: company.size || null,
        country: company.country || 'India',
        city: company.city || null,
        logo_url: company.logo_url || null
      }))
      .eq('id', orgId);
    if (orgError) throw orgError;

    const departmentRows = departments
      .filter((dept) => dept.name?.trim())
      .slice(0, 5)
      .map((dept) => ({ name: dept.name.trim(), description: dept.description || null, organization_id: orgId }));
    let createdDepartments = [];
    if (departmentRows.length) {
      const departmentNames = [...new Set(departmentRows.map((dept) => dept.name))];
      const { data: existingDepartments, error: existingDeptError } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', orgId)
        .in('name', departmentNames);
      if (existingDeptError) throw existingDeptError;

      const existingNames = new Set((existingDepartments || []).map((dept) => dept.name.toLowerCase()));
      const newDepartments = departmentRows.filter((dept) => !existingNames.has(dept.name.toLowerCase()));

      let insertedDepartments = [];
      if (newDepartments.length) {
        const { data, error } = await supabase.from('departments').insert(newDepartments).select('id, name');
        if (error) throw error;
        insertedDepartments = data || [];
      }
      createdDepartments = [...(existingDepartments || []), ...insertedDepartments];
    }

    const { data: adminUser } = await supabase.from('users').select('name').eq('id', adminId).single();
    const { data: org } = await supabase.from('organizations').select('name').eq('id', orgId).single();
    const deptByName = new Map(createdDepartments.map((dept) => [dept.name.toLowerCase(), dept.id]));

    const normalizedEmployeeEmails = [...new Set(
      employees
        .slice(0, 15)
        .map((employee) => employee.email?.toLowerCase().trim())
        .filter(Boolean)
    )];
    const { data: existingUsers, error: existingUsersError } = normalizedEmployeeEmails.length
      ? await supabase.from('users').select('email').in('email', normalizedEmployeeEmails)
      : { data: [], error: null };
    if (existingUsersError) throw existingUsersError;
    const registeredEmails = new Set((existingUsers || []).map((item) => item.email));

    const inviteRows = [];
    const inviteEmailsToNotify = [];
    const skippedInvites = [];
    for (const employee of employees.slice(0, 15)) {
      if (!employee.email) continue;
      const normalizedEmployeeEmail = employee.email.toLowerCase().trim();
      if (registeredEmails.has(normalizedEmployeeEmail)) {
        skippedInvites.push({ email: normalizedEmployeeEmail, reason: 'already_registered' });
        continue;
      }
      const inviteToken = crypto.randomUUID();
      const deptId = employee.department_id || deptByName.get(String(employee.department || '').toLowerCase()) || null;
      const employeeRole = VALID_ROLES.includes(employee.role) ? employee.role : 'employee';
      const employeePhone = employee.phone_number ? String(employee.phone_number).trim() : null;
      if (employeePhone && !isValidPhoneNumber(employeePhone)) {
        skippedInvites.push({ email: normalizedEmployeeEmail, reason: 'invalid_phone_number' });
        continue;
      }
      inviteRows.push({
        organization_id: orgId,
        company_id: orgId,
        email: normalizedEmployeeEmail,
        name: employee.name || null,
        phone_number: employeePhone,
        role: employeeRole,
        department_id: deptId,
        invited_by: adminId,
        token: inviteToken,
        expires_at: addDays(7),
        status: 'pending'
      });
      inviteEmailsToNotify.push({
        email: normalizedEmployeeEmail,
        adminName: adminUser?.name || 'Your admin',
        companyName: org?.name || 'your company',
        token: inviteToken
      });
    }

    let invitations = [];
    if (inviteRows.length) {
      const { data, error } = await supabase.from('employee_invitations').insert(inviteRows).select();
      if (error) throw error;
      invitations = data || [];
      await Promise.allSettled(inviteEmailsToNotify.map((invite) => sendWorkspaceInviteEmail(invite)));
    }

    let inviteLink = null;
    if (generate_invite_link) {
      const code = crypto.randomBytes(6).toString('hex');
      const { data, error } = await supabase
        .from('invite_links')
        .insert([{ company_id: orgId, organization_id: orgId, code, created_by: adminId, expires_at: addDays(7), max_uses: 15, uses_count: 0 }])
        .select()
        .single();
      if (error) throw error;
      inviteLink = { ...data, url: `${CLIENT_URL}/join/${code}` };
    }

    await supabase.from('users').update({ onboarding_complete: true }).eq('id', adminId);

    return res.status(200).json({ success: true, departments: createdDepartments, invitations, skipped_invites: skippedInvites, invite_link: inviteLink, redirect_to: '/dashboard/admin' });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete onboarding.', error: error.message });
  }
};
