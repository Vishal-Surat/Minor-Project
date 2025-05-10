// backend/src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import User from '../models/User.js';
import Log from '../models/Log.js'; // Add this import for logging
import { validatePasswordStrength } from '../middleware/security.middleware.js'; // Add this import

// Generate JWT with proper expiration
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret_key_for_development', {
    expiresIn: '7d',
  });
};

// Configure cookie settings based on environment
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only use secure in production (requires HTTPS)
    sameSite: isProd ? 'none' : 'lax', // 'none' for cross-site in production, 'lax' for dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/', // Ensure cookie is available on all paths
  };
};

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendError(res, 'All fields are required', 'Validation failed', 400);
  }

  if (!validator.isEmail(email)) {
    return sendError(res, 'Invalid email format', 'Validation failed', 400);
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.success) {
    return sendError(res, passwordValidation.message, 'Password too weak', 400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return sendError(res, 'Email already registered', 'Validation failed', 400);
  }

  // Create new user - model hook will handle password hashing
  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);

  // Set JWT in httpOnly cookie
  res.cookie('token', token, getCookieOptions());

  // Log successful registration
  const clientIP = req.ip || req.connection.remoteAddress;
  await Log.create({
    sourceIP: clientIP,
    destinationIP: req.get('host') || 'unknown',
    severity: 'low',
    message: `New user registered: ${user.email} (${user._id})`,
    detectedBy: 'AuthSystem',
    status: 'active',
  });

  return sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token, // Also send token in response for debugging/development
  }, 'User registered successfully', 201);
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;

  // Basic validation
  if (!email || !password) {
    return sendError(res, 'Email and password are required', 'Validation failed', 400);
  }

  // Email format validation
  if (!validator.isEmail(email)) {
    return sendError(res, 'Invalid email format', 'Validation failed', 400);
  }

  // Find user by email and include password for comparison
  // Also include lockout fields
  const user = await User.findOne({ email }).select('+password +failedLoginAttempts +lockUntil');
  if (!user) {
    // Log failed attempt for non-existent user
    await Log.create({
      sourceIP: clientIP,
      destinationIP: req.get('host') || 'unknown',
      severity: 'medium',
      message: `Failed login attempt: user not found (${email})`,
      detectedBy: 'AuthSystem',
      status: 'active',
    });
    
    return sendError(res, 'User not found', 'Authentication failed', 401);
  }

  // Check if account is locked
  if (user.isLocked()) {
    // Calculate remaining lockout time in minutes
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
    
    // Log locked account attempt
    await Log.create({
      sourceIP: clientIP,
      destinationIP: req.get('host') || 'unknown',
      severity: 'high',
      message: `Login attempt on locked account: ${email}`,
      detectedBy: 'AuthSystem',
      status: 'active',
    });
    
    return sendError(
      res, 
      `Account is temporarily locked. Please try again in ${remainingTime} ${remainingTime === 1 ? 'minute' : 'minutes'}`, 
      'Account locked', 
      403
    );
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    // Increment failed login attempts and possibly lock account
    await user.incrementLoginAttempts();
    
    // Log failed attempt
    await Log.create({
      sourceIP: clientIP,
      destinationIP: req.get('host') || 'unknown',
      severity: 'medium',
      message: `Failed login attempt: incorrect password (${email})`,
      detectedBy: 'AuthSystem',
      status: 'active',
    });
    
    // Check if this attempt has locked the account
    const updatedUser = await User.findOne({ email }).select('+failedLoginAttempts +lockUntil');
    if (updatedUser.isLocked()) {
      return sendError(res, 'Too many failed login attempts. Account locked for 5 minutes.', 'Account locked', 403);
    }
    
    return sendError(res, 'Incorrect password', 'Authentication failed', 401);
  }

  // Reset failed login attempts on successful login
  await user.resetLoginAttempts();

  // Generate token and set cookie
  const token = generateToken(user._id);
  
  // Log cookie settings for debugging
  console.log('Setting cookie with options:', getCookieOptions());
  
  res.cookie('token', token, getCookieOptions());

  // Log successful login
  await Log.create({
    sourceIP: clientIP,
    destinationIP: req.get('host') || 'unknown',
    severity: 'low',
    message: `Successful login: ${user.email} (${user._id})`,
    detectedBy: 'AuthSystem',
    status: 'active',
  });

  // Return success response
  return sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token, // Also send token in response for debugging/development
  }, 'Login successful', 200);
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
  // Clear the token cookie with same options (except maxAge)
  const cookieOptions = { ...getCookieOptions(), maxAge: 0 };
  res.clearCookie('token', cookieOptions);
  
  return sendSuccess(res, null, 'Logged out successfully', 200);
});

// Get User Profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return sendError(res, 'User not found', 'Profile retrieval failed', 404);
  }

  return sendSuccess(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }, 'User profile fetched successfully', 200);
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;

  if (!currentPassword || !newPassword) {
    return sendError(res, 'Current password and new password are required', 'Validation failed', 400);
  }

  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.success) {
    return sendError(res, passwordValidation.message, 'Password too weak', 400);
  }

  // Find user and include password
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return sendError(res, 'User not found', 'Authentication failed', 404);
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    // Log failed password change attempt
    await Log.create({
      sourceIP: clientIP,
      destinationIP: req.get('host') || 'unknown',
      severity: 'medium',
      message: `Failed password change attempt: incorrect current password (${user.email})`,
      detectedBy: 'AuthSystem',
      status: 'active',
    });
    
    return sendError(res, 'Current password is incorrect', 'Authentication failed', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Log successful password change
  await Log.create({
    sourceIP: clientIP,
    destinationIP: req.get('host') || 'unknown',
    severity: 'medium',
    message: `Password changed successfully for user: ${user.email}`,
    detectedBy: 'AuthSystem',
    status: 'active',
  });

  return sendSuccess(res, null, 'Password changed successfully', 200);
});
