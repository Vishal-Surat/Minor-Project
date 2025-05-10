// src/config/cron.config.js
import cron from 'node-cron';
import { emitThreatAlert } from '../services/websocketService.js';
import Alert from '../models/Alert.js';
import Log from '../models/Log.js';
import { checkBruteForceByIP } from '../services/securityMonitorService.js';

// Store blocked IPs with timeout (in-memory store)
// In a production environment, use Redis or a similar solution
const blockedIPs = new Map();

/**
 * Check if an IP is currently blocked
 * @param {string} ip - The IP to check
 * @returns {boolean} - True if blocked
 */
export const isIPBlocked = (ip) => {
  return blockedIPs.has(ip) && blockedIPs.get(ip) > Date.now();
};

/**
 * Block an IP for a specified duration
 * @param {string} ip - The IP to block
 * @param {number} durationMinutes - Duration in minutes
 */
export const blockIP = (ip, durationMinutes = 5) => {
  const expireTime = Date.now() + (durationMinutes * 60 * 1000);
  blockedIPs.set(ip, expireTime);
  console.log(`🔒 IP ${ip} blocked for ${durationMinutes} minutes`);
};

/**
 * Initialize cron jobs for the application
 */
const cronJobs = () => {
  console.log('📅 Setting up cron jobs...');

  // Clean up old logs (every day at midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running scheduled task: Cleaning up old logs');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await Log.deleteMany({ 
        createdAt: { $lt: thirtyDaysAgo },
        status: 'resolved'
      });
    } catch (error) {
      console.error('Error in log cleanup cron job:', error);
    }
  });

  // Generate random security alert for demo (every 5 minutes)
  cron.schedule('*/5 * * * *', async () => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Running scheduled task: Generating random alert');
        
        const alertTypes = ['intrusion', 'malware', 'phishing', 'unauthorized-access', 'dos'];
        const severities = ['low', 'medium', 'high', 'critical'];
        
        const newAlert = await Alert.create({
          title: 'Automated Security Alert',
          description: 'This is an automatically generated security alert for demonstration purposes.',
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          source: 'CronJob',
        });
        
        // Emit the new alert via WebSocket
        emitThreatAlert(newAlert);
      }
    } catch (error) {
      console.error('Error in alert generation cron job:', error);
    }
  });

  // Check for brute force attacks and block IPs (every minute)
  cron.schedule('* * * * *', async () => {
    try {
      console.log('Running scheduled task: Checking for brute force attacks');
      
      // Find all failed login attempts in last 15 minutes
      const timeWindow = new Date();
      timeWindow.setMinutes(timeWindow.getMinutes() - 15);
      
      // Find all unique IPs with failed login attempts
      const suspiciousIPs = await Log.aggregate([
        { 
          $match: { 
            message: { $regex: 'Failed login attempt', $options: 'i' },
            createdAt: { $gt: timeWindow }
          } 
        },
        { $group: { _id: "$sourceIP", count: { $sum: 1 } } },
        { $match: { count: { $gt: 5 } } } // IPs with more than 5 failures
      ]);
      
      // Process each suspicious IP
      for (const ip of suspiciousIPs) {
        const sourceIP = ip._id;
        const failedCount = ip.count;
        
        // Skip already blocked IPs
        if (isIPBlocked(sourceIP)) {
          continue;
        }
        
        // If more than 10 failures in 15 minutes, block for 5 minutes
        if (failedCount >= 10) {
          // Block the IP
          blockIP(sourceIP, 5);
          
          // Create an alert
          const alert = await Alert.create({
            title: 'IP Temporarily Blocked',
            description: `IP ${sourceIP} has been blocked for 5 minutes due to ${failedCount} failed login attempts.`,
            type: 'unauthorized-access',
            severity: 'high',
            source: 'SecurityMonitor',
          });
          
          // Emit the alert
          emitThreatAlert(alert);
          
          console.log(`🚨 Blocked IP ${sourceIP} for 5 minutes due to brute force attempt`);
        }
      }
      
      // Clean up expired IP blocks
      for (const [ip, expireTime] of blockedIPs.entries()) {
        if (expireTime <= Date.now()) {
          blockedIPs.delete(ip);
          console.log(`🔓 IP block expired for ${ip}`);
        }
      }
    } catch (error) {
      console.error('Error in brute force detection cron job:', error);
    }
  });

  console.log('✅ Cron jobs set up successfully');
  return { isIPBlocked, blockIP };
};

export default cronJobs;
