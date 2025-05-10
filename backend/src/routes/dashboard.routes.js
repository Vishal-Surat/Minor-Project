import express from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateUser, getDashboardData);


export default router;
