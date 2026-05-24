import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/mailer.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_nudgehq_jwt_key_change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const isSupabaseConnectionError = (error) => (
  error?.message?.includes('fetch failed') ||
  error?.name === 'TypeError'
);

const isMissingOrgSchema = (error) => (
  error?.code === '42P01' ||
  error?.code === '42703' ||
  /organizations|organization_id|schema cache|does not exist/i.test(error?.message || '')
);

const insertWithOptionalOrganization = async (table, payload) => {
  const { data, error } = await supabase
    .from(table)
    .insert([payload])
    .select()
    .single();

  if (!error) return { data };

  if (!isMissingOrgSchema(error) || payload.organization_id === undefined) {
    throw error;
  }

  const { organization_id, ...fallbackPayload } = payload;
  const fallback = await supabase
    .from(table)
    .insert([fallbackPayload])
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
    if (!['admin', 'employee'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be admin or employee.'
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
    const { company_name, admin_name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

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

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: company_name }])
      .select('id, name, created_at')
      .single();

    if (orgError) {
      if (!isMissingOrgSchema(orgError)) throw orgError;
      organizationSchemaReady = false;
    } else {
      organization = orgData;
    }

    const { data: department } = await insertWithOptionalOrganization('departments', {
      name: `${company_name} Operations`,
      description: 'Default workspace created during company onboarding.',
      organization_id: organization?.id
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: adminUser } = await insertWithOptionalOrganization('users', {
      name: admin_name,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'admin',
      department_id: null,
      organization_id: organization?.id,
      is_verified: false
    });

    // Create verification token and send email
    const verificationToken = await createVerificationToken(adminUser.id);
    await sendVerificationEmail(normalizedEmail, admin_name, verificationToken);

    return res.status(201).json({
      success: true,
      message: organizationSchemaReady
        ? 'Company workspace registered. Please check your email to verify and activate your account.'
        : 'Admin account created. Run schema migrations to enable company isolation records.',
      organization,
      default_department: department,
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
      .select('id, name, email, password_hash, role, department_id, organization_id, is_verified, created_at')
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

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: safeUserData
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

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify email.' });
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

    const { data: invitation, error } = await supabase
      .from('employee_invitations')
      .select('id, email, organization_id, status, expires_at, organizations(name)')
      .eq('token', token)
      .maybeSingle();

    if (error) throw error;

    if (!invitation || invitation.status !== 'pending' || new Date() > new Date(invitation.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'This invitation is invalid, expired, or has already been used.'
      });
    }

    return res.status(200).json({
      success: true,
      invitation
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

    // Fetch invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('employee_invitations')
      .select('id, email, organization_id, status, expires_at')
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

    // Create user and link to company automatically
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: invitation.email,
          password_hash: passwordHash,
          role: 'employee',
          organization_id: invitation.organization_id,
          is_verified: true // Magic link serves as verification
        }
      ])
      .select('id, name, email, role, organization_id, department_id')
      .single();

    if (userError) throw userError;

    // Set invitation status to accepted
    await supabase
      .from('employee_invitations')
      .update({ status: 'accepted', user_id: newUser.id })
      .eq('id', invitation.id);

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
      user: newUser
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    return res.status(500).json({ success: false, message: 'Failed to accept invitation.' });
  }
};
