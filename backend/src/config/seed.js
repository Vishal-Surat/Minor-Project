import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Alert from '../models/Alert.js';
import Log from '../models/Log.js';
import { connectDB } from './db.js';

// Load environment variables
dotenv.config();

// Array of sample IPs
const sourceIPs = [
  '192.168.1.100', '10.0.0.5', '172.16.0.10', '192.168.0.25',
  '8.8.8.8', '1.1.1.1', '192.168.1.50', '10.0.0.15'
];

const destinationIPs = [
  '192.168.1.1', '10.0.0.1', '172.16.0.1', '192.168.0.1',
  '216.58.215.110', '151.101.1.140', '104.244.42.65', '13.107.42.14'
];

// Generate a random IP
const randomIP = (ips) => ips[Math.floor(Math.random() * ips.length)];

// Generate random severity
const randomSeverity = () => {
  const severities = ['low', 'medium', 'high', 'critical'];
  const weights = [0.4, 0.3, 0.2, 0.1]; // 40% low, 30% medium, 20% high, 10% critical
  
  const random = Math.random();
  let sum = 0;
  
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) return severities[i];
  }
  
  return severities[0];
};

// Generate random alert type
const randomAlertType = () => {
  const types = ['intrusion', 'malware', 'bruteForce', 'anomaly'];
  return types[Math.floor(Math.random() * types.length)];
};

// Generate random log message
const generateLogMessage = (severity) => {
  const lowMessages = [
    'User login successful',
    'File access granted',
    'Configuration change detected',
    'Scheduled system scan completed',
    'Network connection established'
  ];
  
  const mediumMessages = [
    'Multiple login attempts detected',
    'Unusual file access pattern',
    'Configuration change without approval',
    'Unexpected system resource usage',
    'Connection to uncommon IP address'
  ];
  
  const highMessages = [
    'Failed login attempts from multiple IPs',
    'Suspicious file modification detected',
    'Critical configuration change detected',
    'Unusual outbound data transfer',
    'Connection to known suspicious IP'
  ];
  
  const criticalMessages = [
    'Possible data breach detected',
    'Malware signature detected in file',
    'Critical system file modified',
    'Large data exfiltration detected',
    'Connection to known malicious IP'
  ];
  
  let messages;
  switch (severity) {
    case 'low':
      messages = lowMessages;
      break;
    case 'medium':
      messages = mediumMessages;
      break;
    case 'high':
      messages = highMessages;
      break;
    case 'critical':
      messages = criticalMessages;
      break;
    default:
      messages = lowMessages;
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
};

// Generate random alert title
const generateAlertTitle = (type) => {
  const intrusionTitles = [
    'Unauthorized Access Attempt',
    'Suspicious Login Activity',
    'Port Scanning Detected',
    'Firewall Breach Attempt',
    'Unusual Admin Access'
  ];
  
  const malwareTitles = [
    'Malware Signature Detected',
    'Suspicious File Execution',
    'Potential Ransomware Activity',
    'Virus Scanner Alert',
    'Suspicious Script Execution'
  ];
  
  const bruteForceTitles = [
    'Brute Force Attack Detected',
    'Multiple Failed Logins',
    'Password Attack Attempt',
    'Authentication Flooding',
    'Credential Stuffing Attempt'
  ];
  
  const anomalyTitles = [
    'Unusual Network Traffic',
    'Abnormal System Behavior',
    'Unexpected Data Transfer',
    'Unusual User Activity',
    'Anomalous Process Execution'
  ];
  
  let titles;
  switch (type) {
    case 'intrusion':
      titles = intrusionTitles;
      break;
    case 'malware':
      titles = malwareTitles;
      break;
    case 'bruteForce':
      titles = bruteForceTitles;
      break;
    case 'anomaly':
      titles = anomalyTitles;
      break;
    default:
      titles = anomalyTitles;
  }
  
  return titles[Math.floor(Math.random() * titles.length)];
};

// Generate a random date within the last 7 days
const randomDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7); // 0-7 days ago
  const hoursAgo = Math.floor(Math.random() * 24); // 0-24 hours ago
  const minutesAgo = Math.floor(Math.random() * 60); // 0-60 minutes ago
  
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  
  return now;
};

// Generate logs
const generateLogs = (count) => {
  const logs = [];
  
  for (let i = 0; i < count; i++) {
    const severity = randomSeverity();
    logs.push({
      sourceIP: randomIP(sourceIPs),
      destinationIP: randomIP(destinationIPs),
      severity,
      message: generateLogMessage(severity),
      detectedBy: 'System Monitor',
      status: 'active',
      createdAt: randomDate()
    });
  }
  
  return logs;
};

// Generate alerts
const generateAlerts = (count) => {
  const alerts = [];
  
  for (let i = 0; i < count; i++) {
    const type = randomAlertType();
    const severity = randomSeverity();
    alerts.push({
      title: generateAlertTitle(type),
      description: generateLogMessage(severity),
      type,
      severity,
      source: 'Security Monitor',
      createdAt: randomDate()
    });
  }
  
  return alerts;
};

// Seed the database
const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Clearing existing data...');
    await Alert.deleteMany({});
    await Log.deleteMany({});
    
    console.log('Generating random data...');
    const logs = generateLogs(50);
    const alerts = generateAlerts(20);
    
    console.log('Inserting logs...');
    await Log.insertMany(logs);
    
    console.log('Inserting alerts...');
    await Alert.insertMany(alerts);
    
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 