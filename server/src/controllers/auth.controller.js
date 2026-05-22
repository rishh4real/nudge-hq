import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_nudgehq_jwt_key_change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const isSupabaseConnectionError = (error) => (
  error?.message?.includes('fetch failed') ||
  error?.name === 'TypeError'
);

/**
 * Signup Controller: Registers a new user (admin or employee)
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;

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
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password_hash: passwordHash,
          role: userRole,
          department_id: department_id || null
        }
      ])
      .select('id, name, email, role, department_id, created_at')
      .single();

    if (insertError) {
      throw insertError;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department_id: newUser.department_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(210).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: isSupabaseConnectionError(error)
        ? 'Supabase is not reachable. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env.'
        : 'Failed to register user.',
      error: error.message
    });
  }
};

/**
 * Login Controller: Authenticates user credentials and returns JWT
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user details from database
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, password_hash, role, department_id, created_at')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id
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
        ? 'Supabase is not reachable. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env, then run schema.sql and seed.sql.'
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
      .select('id, name, email, role, department_id, created_at, departments(name)')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

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
