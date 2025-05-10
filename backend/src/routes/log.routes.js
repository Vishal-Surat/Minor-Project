// backend/src/routes/log.routes.js
import { authenticateUser, authorizeAdmin } from '../middleware/auth.middleware.js';
import express from 'express';
import {
  createLog, // Now importing createLog instead of addLog
  getAllLogs,
  getLogById,
  updateLogStatus,
  deleteLog,
} from '../controllers/log.controller.js';

const router = express.Router();

// @route GET /api/logs
router.get('/', authenticateUser, getAllLogs);

// @route GET /api/logs/:id
router.get('/:id', authenticateUser, getLogById);

// @route POST /api/logs
router.post('/', authenticateUser, createLog);

// @route PUT /api/logs/:id
router.put('/:id', authenticateUser, updateLogStatus);

// @route DELETE /api/logs/:id
router.delete('/:id', authenticateUser, authorizeAdmin, deleteLog);

export default router;
