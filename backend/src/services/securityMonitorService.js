import Log from '../models/Log.js';
import Alert from '../models/Alert.js';
import { emitThreatAlert } from './websocketService.js';

/**
 * Check for brute force attacks by IP address
 * @param {string} ip - IP address to check
 * @returns {Promise<boolean>} - True if brute force detected
 */
export const checkBruteForceByIP = async (ip) => {
  try {
    // Look for failed login attempts in the last 15 minutes
    const timeWindow = new Date();
    timeWindow.setMinutes(timeWindow.getMinutes() - 15);
    
    // Count failed login attempts from this IP
    const failedAttempts = await Log.countDocuments({
      sourceIP: ip,
      message: { $regex: 'Failed login attempt', $options: 'i' },
      createdAt: { $gt: timeWindow }
    });
    
    // If more than 10 failed attempts from the same IP in 15 minutes
    if (failedAttempts >= 10) {
      console.log(`🚨 Potential brute force attack detected from IP: ${ip} (${failedAttempts} attempts)`);
      
      // Create a security alert
      const alert = await Alert.create({
        title: 'Possible Brute Force Attack',
        description: `Multiple failed login attempts detected from IP ${ip}. This IP has been temporarily blocked.`,
        type: 'unauthorized-access',
        severity: 'high',
        source: 'SecurityMonitor'
      });
      
      // Emit real-time alert
      emitThreatAlert(alert);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking for brute force attacks:', error);
    return false;
  }
};

/**
 * Check if an IP address is known to be suspicious
 * @param {string} ip - IP address to check
 * @returns {Promise<boolean>} - True if IP is suspicious
 */
export const checkSuspiciousIP = async (ip) => {
  try {
    // This would normally check against a threat intelligence database
    // For demo purposes, we'll use a hardcoded list of suspicious IPs
    const suspiciousIPs = [
      '123.456.789.0',
      '98.76.54.32',
      '111.222.333.444',
      '1.2.3.4'
    ];
    
    if (suspiciousIPs.includes(ip)) {
      // Create a security alert
      const alert = await Alert.create({
        title: 'Connection from Known Malicious IP',
        description: `Connection attempt from ${ip}, which is on the suspicious IP list.`,
        type: 'intrusion',
        severity: 'critical',
        source: 'SecurityMonitor'
      });
      
      // Emit real-time alert
      emitThreatAlert(alert);
      
      // Log the event
      await Log.create({
        sourceIP: ip,
        destinationIP: 'system',
        severity: 'critical',
        message: `Blocked connection from known malicious IP: ${ip}`,
        detectedBy: 'SecurityMonitor',
        status: 'active'
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking suspicious IP:', error);
    return false;
  }
};

/**
 * Initialize security monitoring service
 */
export const initSecurityMonitoring = () => {
  console.log('🔒 Security monitoring service initialized');
  
  // In a real system, you would set up more sophisticated monitoring here
  // For example, network traffic analysis, log parsing, etc.
};

/**
 * Generate security activity report
 * @returns {Promise<Object>} - Security report data
 */
export const generateSecurityReport = async () => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    
    // Get counts of events by severity in the last 24 hours
    const logCounts = await Log.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    // Get counts of alerts by type in the last 24 hours
    const alertCounts = await Alert.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    return {
      timestamp: now,
      period: '24 hours',
      logSeverityCounts: logCounts,
      alertTypeCounts: alertCounts,
      totalLogs: logCounts.reduce((sum, item) => sum + item.count, 0),
      totalAlerts: alertCounts.reduce((sum, item) => sum + item.count, 0)
    };
  } catch (error) {
    console.error('Error generating security report:', error);
    return null;
  }
};

export default {
  initSecurityMonitoring,
  checkBruteForceByIP,
  checkSuspiciousIP,
  generateSecurityReport
}; 