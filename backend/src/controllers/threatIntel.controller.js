// backend/src/controllers/threatIntel.controller.js
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import * as threatIntelService from '../services/threatIntelligenceService.js';
import Log from '../models/Log.js';
import Alert from '../models/Alert.js';

/**
 * Check an IP address against threat intelligence
 * @route GET /api/threat-intel/ip/:ip
 */
export const checkIP = asyncHandler(async (req, res) => {
  const { ip } = req.params;
  
  // Basic IP format validation
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return sendError(res, 'Invalid IP address format', 'Validation Error', 400);
  }
  
  try {
    const result = await threatIntelService.checkIPReputation(ip);
    
    if (result.error) {
      return sendError(res, `Error checking IP reputation: ${result.message}`, 'API Error', 500);
    }
    
    return sendSuccess(res, result, `IP reputation check complete for ${ip}`);
  } catch (error) {
    return sendError(res, `Error checking IP reputation: ${error.message}`, 'Server Error', 500);
  }
});

/**
 * Check a domain against threat intelligence
 * @route GET /api/threat-intel/domain/:domain
 */
export const checkDomain = asyncHandler(async (req, res) => {
  const { domain } = req.params;
  
  // Basic domain format validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return sendError(res, 'Invalid domain format', 'Validation Error', 400);
  }
  
  try {
    const result = await threatIntelService.checkDomainReputation(domain);
    
    if (result.error) {
      return sendError(res, `Error checking domain reputation: ${result.message}`, 'API Error', 500);
    }
    
    return sendSuccess(res, result, `Domain reputation check complete for ${domain}`);
  } catch (error) {
    return sendError(res, `Error checking domain reputation: ${error.message}`, 'Server Error', 500);
  }
});

/**
 * Get all suspicious IPs
 * @route GET /api/threat-intel/suspicious-ips
 */
export const getSuspiciousIPs = asyncHandler(async (req, res) => {
  try {
    const suspiciousIPs = await threatIntelService.getAllSuspiciousIPs();
    return sendSuccess(res, suspiciousIPs, 'Suspicious IPs retrieved successfully');
  } catch (error) {
    return sendError(res, `Error retrieving suspicious IPs: ${error.message}`, 'Server Error', 500);
  }
});

/**
 * Get all suspicious domains
 * @route GET /api/threat-intel/suspicious-domains
 */
export const getSuspiciousDomains = asyncHandler(async (req, res) => {
  try {
    const suspiciousDomains = await threatIntelService.getAllSuspiciousDomains();
    return sendSuccess(res, suspiciousDomains, 'Suspicious domains retrieved successfully');
  } catch (error) {
    return sendError(res, `Error retrieving suspicious domains: ${error.message}`, 'Server Error', 500);
  }
});

/**
 * Add a new suspicious IP
 * @route POST /api/threat-intel/suspicious-ips
 */
export const addSuspiciousIP = asyncHandler(async (req, res) => {
  const { ip, reason, riskScore, source } = req.body;
  
  // Validate required fields
  if (!ip || !reason) {
    return sendError(res, 'IP and reason are required', 'Validation Error', 400);
  }
  
  // Basic IP format validation
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return sendError(res, 'Invalid IP address format', 'Validation Error', 400);
  }
  
  try {
    const newSuspiciousIP = await threatIntelService.addSuspiciousIP({
      ip,
      reason,
      riskScore: riskScore || 75,
      source: source || 'Manual Entry'
    });
    
    return sendSuccess(res, newSuspiciousIP, 'Suspicious IP added successfully');
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error
      return sendError(res, 'This IP is already in the suspicious list', 'Validation Error', 400);
    }
    return sendError(res, `Error adding suspicious IP: ${error.message}`, 'Server Error', 500);
  }
});

/**
 * Add a new suspicious domain
 * @route POST /api/threat-intel/suspicious-domains
 */
export const addSuspiciousDomain = asyncHandler(async (req, res) => {
  const { domain, reason, riskScore, source } = req.body;
  
  // Validate required fields
  if (!domain || !reason) {
    return sendError(res, 'Domain and reason are required', 'Validation Error', 400);
  }
  
  // Basic domain format validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return sendError(res, 'Invalid domain format', 'Validation Error', 400);
  }
  
  try {
    const newSuspiciousDomain = await threatIntelService.addSuspiciousDomain({
      domain,
      reason,
      riskScore: riskScore || 75,
      source: source || 'Manual Entry'
    });
    
    return sendSuccess(res, newSuspiciousDomain, 'Suspicious domain added successfully');
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error
      return sendError(res, 'This domain is already in the suspicious list', 'Validation Error', 400);
    }
    return sendError(res, `Error adding suspicious domain: ${error.message}`, 'Server Error', 500);
  }
});

/**
 * Get recent threats from threat intelligence
 * @route GET /api/threat-intel/recent
 */
export const getRecentThreats = asyncHandler(async (req, res) => {
  try {
    const result = await threatIntelService.getRecentThreats();
    
    if (result.error) {
      return sendError(res, `Error fetching recent threats: ${result.message}`, 'API Error', 500);
    }
    
    return sendSuccess(res, result, 'Recent threats retrieved successfully');
  } catch (error) {
    return sendError(res, `Error fetching recent threats: ${error.message}`, 'Server Error', 500);
  }
});

/**
 * Get threat intelligence dashboard data
 * @route GET /api/threat-intel/dashboard
 */
export const getThreatIntelDashboard = asyncHandler(async (req, res) => {
  try {
    // Get timeframe from query params, default to last 7 days
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all security alerts
    const securityAlerts = await Alert.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });
    
    // Aggregate alerts by type
    const alertsByType = await Alert.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate }
        } 
      },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    // Aggregate alerts by severity
    const alertsBySeverity = await Alert.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate }
        } 
      },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    // Get security logs
    const logs = await Log.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 }).limit(20);
    
    // Get recent threats data
    const recentThreats = await threatIntelService.getRecentThreats();
    
    // Get suspicious IPs and domains
    const suspiciousIPs = await threatIntelService.getAllSuspiciousIPs();
    const suspiciousDomains = await threatIntelService.getAllSuspiciousDomains();
    
    // Format response data
    const dashboardData = {
      summary: {
        totalAlerts: securityAlerts.length,
        byType: alertsByType,
        bySeverity: alertsBySeverity
      },
      recentAlerts: securityAlerts.slice(0, 10).map(alert => ({
        id: alert._id,
        title: alert.title,
        description: alert.description,
        type: alert.type,
        severity: alert.severity,
        createdAt: alert.createdAt
      })),
      recentChecks: logs.map(log => ({
        id: log._id,
        message: log.message,
        sourceIP: log.sourceIP,
        destinationIP: log.destinationIP,
        severity: log.severity,
        createdAt: log.createdAt
      })),
      threatStatistics: recentThreats.statistics || {},
      suspiciousIPs: suspiciousIPs.slice(0, 10),
      suspiciousDomains: suspiciousDomains.slice(0, 10)
    };
    
    return sendSuccess(res, dashboardData, 'Security dashboard data retrieved successfully');
  } catch (error) {
    return sendError(res, `Error getting security dashboard: ${error.message}`, 'Server Error', 500);
  }
}); 