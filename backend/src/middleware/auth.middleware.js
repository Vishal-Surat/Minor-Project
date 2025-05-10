import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const authenticateUser = asyncHandler(async (req, res, next) => {
  // Check for token in cookies
  const token = req.cookies.token;
  
  console.log('Auth middleware - Cookies received:', req.cookies);

  if (!token) {
    console.log('No token found in cookies');
    return sendError(res, 'No authentication token found', 'Unauthorized', 401);
  }

  try {
    // Verify token with the same secret that was used to sign it
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
    console.log('Verifying JWT with secret key');
    
    const decoded = jwt.verify(token, secret);
    console.log('JWT decoded successfully:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log('User not found with ID from token:', decoded.id);
      return sendError(res, 'User not found', 'Unauthorized', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token', 'Unauthorized', 401);
    } else if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', 'Unauthorized', 401);
    }
    
    return sendError(res, 'Authentication failed', 'Unauthorized', 401);
  }
});

// Generalized role-based authorization
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res, 
        `Role ${req.user.role} is not allowed to access this resource`,
        'Forbidden',
        403
      );
    }
    next();
  };
};

// Specific role-based authorization for Admin
export const authorizeAdmin = (req, res, next) => {
  return authorizeRoles('admin')(req, res, next);
};
