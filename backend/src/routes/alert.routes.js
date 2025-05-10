import express from 'express';
import {
  createAlert,
  getAllAlerts,
  getAlertById,
  resolveAlert, // Use resolveAlert for marking alert as resolved
  deleteAlert,
} from '../controllers/alert.controller.js';
import { authenticateUser, authorizeAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route GET /api/alerts
router.get('/', authenticateUser, getAllAlerts);

// @route GET /api/alerts/:id
router.get('/:id', authenticateUser, getAlertById);

// @route POST /api/alerts
router.post('/', authenticateUser, createAlert);

// @route PUT /api/alerts/:id (Resolve alert)
router.put('/:id', authenticateUser, resolveAlert); // Use resolveAlert here

// @route DELETE /api/alerts/:id
router.delete('/:id', authenticateUser, authorizeAdmin, deleteAlert);

export default router;
