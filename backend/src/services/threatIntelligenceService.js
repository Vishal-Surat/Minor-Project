import Log from '../models/Log.js';
import Alert from '../models/Alert.js';
import { emitThreatAlert } from './websocketService.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables 
dotenv.config();

// Create a new schema for suspicious IPs
const suspiciousIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String, required: true },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  firstDetected: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  source: { type: String, default: 'Manual Entry' }
});

// Create a new schema for suspicious domains
const suspiciousDomainSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  reason: { type: String, required: true },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  firstDetected: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  source: { type: String, default: 'Manual Entry' }
});

// Create models if they don't exist
const SuspiciousIP = mongoose.models.SuspiciousIP || mongoose.model('SuspiciousIP', suspiciousIPSchema);
const SuspiciousDomain = mongoose.models.SuspiciousDomain || mongoose.model('SuspiciousDomain', suspiciousDomainSchema);

// Seed some initial data if none exists
const seedInitialData = async () => {
  // Check if we have any suspicious IPs
  const ipCount = await SuspiciousIP.countDocuments();
  if (ipCount === 0) {
    console.log('Seeding initial suspicious IP data...');
    const initialIPs = [
      { 
        ip: '192.168.100.50', 
        reason: 'Known malicious activity', 
        riskScore: 85,
        source: 'System Initialization'
      },
      { 
        ip: '10.0.0.99', 
        reason: 'Port scanning activity', 
        riskScore: 75,
        source: 'System Initialization'
      },
      { 
        ip: '172.16.0.200', 
        reason: 'Brute force attempts', 
        riskScore: 80,
        source: 'System Initialization'
      }
    ];
    
    await SuspiciousIP.insertMany(initialIPs);
  }
  
  // Check if we have any suspicious domains
  const domainCount = await SuspiciousDomain.countDocuments();
  if (domainCount === 0) {
    console.log('Seeding initial suspicious domain data...');
    const initialDomains = [
      { 
        domain: 'evil-domain.com', 
        reason: 'Known phishing site', 
        riskScore: 90,
        source: 'System Initialization'
      },
      { 
        domain: 'malware-site.org', 
        reason: 'Malware distribution', 
        riskScore: 95,
        source: 'System Initialization'
      },
      { 
        domain: 'phishing-example.net', 
        reason: 'Credential harvesting', 
        riskScore: 85,
        source: 'System Initialization'
      }
    ];
    
    await SuspiciousDomain.insertMany(initialDomains);
  }
};

/**
 * Check IP reputation using MongoDB data
 * @param {string} ip - IP address to check
 * @returns {Promise<Object>} - Threat intelligence data
 */
export const checkIPReputation = async (ip) => {
  try {
    console.log(`🔍 Checking IP ${ip} against MongoDB intelligence`);
    
    // Check if IP is in our database of suspicious IPs
    const suspiciousIP = await SuspiciousIP.findOne({ ip });
    const malicious = !!suspiciousIP;
    
    // Generate risk score (0-100)
    const riskScore = malicious ? suspiciousIP.riskScore : Math.floor(Math.random() * 30);
    
    // Store the result for future reference
    await Log.create({
      sourceIP: ip,
      destinationIP: 'system',
      severity: malicious ? 'medium' : 'low',
      message: `IP reputation check: ${ip} ${malicious ? 'found suspicious' : 'appears clean'}`,
      detectedBy: 'Threat Intelligence',
      status: 'active'
    });
    
    // If IP is found suspicious
    if (malicious) {
      // Update last seen timestamp
      await SuspiciousIP.updateOne({ ip }, { lastSeen: new Date() });
      
      // Create an alert for suspicious IP
      const alert = await Alert.create({
        title: 'Suspicious IP Detected',
        description: `IP ${ip} matches patterns associated with suspicious activity (Risk Score: ${riskScore})`,
        type: 'intrusion',
        severity: 'medium',
        source: 'Threat Intelligence'
      });
      
      // Emit the alert
      emitThreatAlert(alert);
      
      return {
        ip,
        malicious: true,
        riskScore,
        reason: suspiciousIP.reason
      };
    }
    
    return {
      ip,
      malicious: false,
      riskScore,
      reason: 'No threats detected'
    };
  } catch (error) {
    console.error(`Error checking IP reputation for ${ip}:`, error.message);
    return {
      ip,
      error: true,
      message: error.message
    };
  }
};

/**
 * Check domain reputation using MongoDB data
 * @param {string} domain - Domain to check
 * @returns {Promise<Object>} - Threat intelligence data
 */
export const checkDomainReputation = async (domain) => {
  try {
    console.log(`🔍 Checking domain ${domain} against MongoDB intelligence`);
    
    // Check if domain is in our database of suspicious domains
    const suspiciousDomain = await SuspiciousDomain.findOne({ domain });
    const malicious = !!suspiciousDomain;
    
    // Generate risk score (0-100)
    const riskScore = malicious ? suspiciousDomain.riskScore : Math.floor(Math.random() * 30);
    
    // Store the result for future reference
    await Log.create({
      sourceIP: 'system',
      destinationIP: domain,
      severity: malicious ? 'medium' : 'low',
      message: `Domain reputation check: ${domain} ${malicious ? 'found suspicious' : 'appears clean'}`,
      detectedBy: 'Threat Intelligence',
      status: 'active'
    });
    
    // If domain is found suspicious
    if (malicious) {
      // Update last seen timestamp
      await SuspiciousDomain.updateOne({ domain }, { lastSeen: new Date() });
      
      // Create an alert for suspicious domain
      const alert = await Alert.create({
        title: 'Suspicious Domain Detected',
        description: `Domain ${domain} is identified as potentially malicious (Risk Score: ${riskScore})`,
        type: 'malware',
        severity: 'medium',
        source: 'Threat Intelligence'
      });
      
      // Emit the alert
      emitThreatAlert(alert);
      
      return {
        domain,
        malicious: true,
        riskScore,
        reason: suspiciousDomain.reason
      };
    }
    
    return {
      domain,
      malicious: false,
      riskScore,
      reason: 'No threats detected'
    };
  } catch (error) {
    console.error(`Error checking domain reputation for ${domain}: ${error.message}`);
    return {
      domain,
      error: true,
      message: error.message
    };
  }
};

/**
 * Add a new suspicious IP to the database
 * @param {Object} ipData - Data about the suspicious IP
 * @returns {Promise<Object>} - The created suspicious IP record
 */
export const addSuspiciousIP = async (ipData) => {
  try {
    const newSuspiciousIP = await SuspiciousIP.create(ipData);
    return newSuspiciousIP;
  } catch (error) {
    console.error(`Error adding suspicious IP: ${error.message}`);
    throw error;
  }
};

/**
 * Add a new suspicious domain to the database
 * @param {Object} domainData - Data about the suspicious domain
 * @returns {Promise<Object>} - The created suspicious domain record
 */
export const addSuspiciousDomain = async (domainData) => {
  try {
    const newSuspiciousDomain = await SuspiciousDomain.create(domainData);
    return newSuspiciousDomain;
  } catch (error) {
    console.error(`Error adding suspicious domain: ${error.message}`);
    throw error;
  }
};

/**
 * Get all suspicious IPs from the database
 * @returns {Promise<Array>} - List of suspicious IPs
 */
export const getAllSuspiciousIPs = async () => {
  try {
    return await SuspiciousIP.find().sort({ lastSeen: -1 });
  } catch (error) {
    console.error(`Error getting suspicious IPs: ${error.message}`);
    throw error;
  }
};

/**
 * Get all suspicious domains from the database
 * @returns {Promise<Array>} - List of suspicious domains
 */
export const getAllSuspiciousDomains = async () => {
  try {
    return await SuspiciousDomain.find().sort({ lastSeen: -1 });
  } catch (error) {
    console.error(`Error getting suspicious domains: ${error.message}`);
    throw error;
  }
};

/**
 * Get recent threat data for dashboard
 * @returns {Promise<Object>} Recent threat statistics
 */
export const getRecentThreats = async () => {
  try {
    // Get recent alerts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAlerts = await Alert.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 }).limit(10);
    
    // Generate some statistical data
    const statistics = {
      totalThreats: recentAlerts.length,
      byType: {
        malware: recentAlerts.filter(a => a.type === 'malware').length,
        intrusion: recentAlerts.filter(a => a.type === 'intrusion').length,
        bruteForce: recentAlerts.filter(a => a.type === 'bruteForce').length,
      },
      bySeverity: {
        critical: recentAlerts.filter(a => a.severity === 'critical').length,
        high: recentAlerts.filter(a => a.severity === 'high').length,
        medium: recentAlerts.filter(a => a.severity === 'medium').length,
        low: recentAlerts.filter(a => a.severity === 'low').length,
      }
    };
    
    return {
      recentAlerts,
      statistics
    };
  } catch (error) {
    console.error('Error getting recent threats:', error.message);
    return {
      error: true,
      message: error.message
    };
  }
};

/**
 * Initialize threat intelligence services
 * Sets up resources needed for threat intelligence operations
 */
export const initThreatIntelligence = async () => {
  console.log('🛡️ Initializing Threat Intelligence service...');
  
  // Seed initial data if needed
  await seedInitialData();
  
  console.log('✅ Threat Intelligence service initialized with MongoDB data');
};