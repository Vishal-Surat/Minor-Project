// src/config/db.config.js
import mongoose from 'mongoose';
import Log from '../models/Log.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';

// Track connection state
let isConnected = false;

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  // If already connected, return the existing connection
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  // If mongoose has an active connection, don't try to connect again
  if (mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    isConnected = true;
    return;
  }

  try {
    // Set mongoose options
    const mongooseOptions = {
      autoIndex: true,
    };

    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/security-dashboard';
    
    // Connect to MongoDB
    const conn = await mongoose.connect(connectionString, mongooseOptions);
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed database after successful connection
    await seedDatabaseIfEmpty();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Seed the database with initial data if empty
 */
const seedDatabaseIfEmpty = async () => {
  try {
    // Check if there's any data already
    const usersCount = await User.countDocuments();
    const logsCount = await Log.countDocuments();
    const alertsCount = await Alert.countDocuments();

    // If we already have data, don't seed
    if (usersCount > 0 && logsCount > 0 && alertsCount > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    console.log('Seeding database with initial data...');

    // Create admin user if none exists
    if (usersCount === 0) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      
      await User.create({
        name: 'Test User',
        email: 'user@example.com',
        password: 'user123',
        role: 'user'
      });
      
      console.log('Created default users');
    }

    // Seed Logs
    if (logsCount === 0) {
      const logSeverities = ['low', 'medium', 'high', 'critical'];
      const sourceIPs = [
        '192.168.1.100', '192.168.1.101', '10.0.0.15', '172.16.0.20',
        '8.8.8.8', '1.1.1.1', '203.0.113.10', '198.51.100.23'
      ];
      const destIPs = [
        '192.168.1.1', '192.168.1.5', '10.0.0.1', '172.16.0.1',
        '104.244.42.65', '151.101.1.140', '13.32.204.63', '199.232.77.140'
      ];
      
      const logMessages = [
        'Failed login attempt',
        'Suspicious file access',
        'Port scanning detected',
        'Unusual outbound traffic',
        'Malware signature detected',
        'DDoS attack attempted',
        'Data exfiltration suspected',
        'Firewall rule violation'
      ];
      
      const logs = [];
      
      // Create 40 random logs
      for (let i = 0; i < 40; i++) {
        const severity = logSeverities[Math.floor(Math.random() * logSeverities.length)];
        const sourceIP = sourceIPs[Math.floor(Math.random() * sourceIPs.length)];
        const destinationIP = destIPs[Math.floor(Math.random() * destIPs.length)];
        const message = logMessages[Math.floor(Math.random() * logMessages.length)];
        
        // Create a timestamp within the last 7 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 7));
        
        logs.push({
          sourceIP,
          destinationIP,
          severity,
          message,
          detectedBy: Math.random() > 0.5 ? 'System' : 'Intrusion Detection',
          status: Math.random() > 0.7 ? 'resolved' : 'active',
          createdAt: date
        });
      }
      
      await Log.insertMany(logs);
      console.log('Inserted sample logs');
    }

    // Seed Alerts
    if (alertsCount === 0) {
      const alertSeverities = ['low', 'medium', 'high', 'critical'];
      const alertTypes = ['intrusion', 'malware', 'phishing', 'unauthorized-access', 'dos'];
      
      const alertTitles = [
        'Malware Detected',
        'Brute Force Attack',
        'Phishing Email Detected',
        'Unauthorized Access Attempt',
        'Suspicious Login',
        'Data Breach Detected',
        'Ransomware Attempt',
        'Unusual Network Traffic'
      ];
      
      const alertDescriptions = [
        'Malicious software detected on workstation',
        'Multiple failed login attempts detected',
        'Phishing email blocked from external sender',
        'Unauthorized access attempt to protected resource',
        'Login from unusual location detected',
        'Potential data breach from internal system',
        'Ransomware signature detected in email attachment',
        'Unusual outbound traffic pattern detected'
      ];
      
      const alerts = [];
      
      // Create 15 random alerts
      for (let i = 0; i < 15; i++) {
        const severity = alertSeverities[Math.floor(Math.random() * alertSeverities.length)];
        const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const titleIndex = Math.floor(Math.random() * alertTitles.length);
        
        // Create a timestamp within the last 3 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 3));
        
        alerts.push({
          title: alertTitles[titleIndex],
          description: alertDescriptions[titleIndex],
          type,
          severity,
          isResolved: Math.random() > 0.7,
          source: Math.random() > 0.5 ? 'InternalSystem' : 'ThreatIntelligence',
          createdAt: date
        });
      }
      
      await Alert.insertMany(alerts);
      console.log('Inserted sample alerts');
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err.message}`);
});

// Handle disconnection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default connectDB;
