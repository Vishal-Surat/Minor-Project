// backend/src/routes/threatIntelligence.routes.js
import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import * as threatIntelController from '../controllers/threatIntel.controller.js';

const router = express.Router();

// All threat intelligence routes should be protected
router.use(authenticateUser);

// Check IP reputation
router.get('/ip/:ip', threatIntelController.checkIP);

// Check domain reputation
router.get('/domain/:domain', threatIntelController.checkDomain);

// Get recent threats
router.get('/recent', threatIntelController.getRecentThreats);

// Get threat intel dashboard data
router.get('/dashboard', threatIntelController.getThreatIntelDashboard);

// Get all suspicious IPs
router.get('/suspicious-ips', threatIntelController.getSuspiciousIPs);

// Get all suspicious domains
router.get('/suspicious-domains', threatIntelController.getSuspiciousDomains);

// Add a new suspicious IP
router.post('/suspicious-ips', threatIntelController.addSuspiciousIP);

// Add a new suspicious domain
router.post('/suspicious-domains', threatIntelController.addSuspiciousDomain);

export default router; 