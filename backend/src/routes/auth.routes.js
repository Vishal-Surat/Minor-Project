// backend/src/routes/auth.routes.js
import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// @route POST /api/auth/register
router.post('/register', authRateLimiter, registerUser);

// @route POST /api/auth/login
router.post('/login', authRateLimiter, loginUser);

// @route POST /api/auth/logout
router.post('/logout', authenticateUser, logoutUser);

// @route GET /api/auth/profile
router.get('/profile', authenticateUser, getUserProfile);

// @route POST /api/auth/change-password
router.post('/change-password', authenticateUser, authRateLimiter, changePassword);

export default router;
