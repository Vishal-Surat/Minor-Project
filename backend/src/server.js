// // backend/src/server.js
// import dotenv from 'dotenv';

// // Load environment variables first, before other imports
// dotenv.config();

// import express from 'express';
// import http from 'http';
// import cors from 'cors';
// import morgan from 'morgan';
// import cookieParser from 'cookie-parser';
// import path from 'path';

// import connectDB from './config/db.config.js';
// import cronJobs, { isIPBlocked } from './config/cron.config.js';
// import authRoutes from './routes/auth.routes.js';
// import logRoutes from './routes/log.routes.js';
// import alertRoutes from './routes/alert.routes.js';
// import threatIntelRoutes from './routes/threatIntelligence.routes.js';
// import { notFound, errorHandler } from './middleware/error.middleware.js';
// import { securityHeaders } from './middleware/security.middleware.js';
// import { rateLimiter } from './middleware/rateLimit.middleware.js';
// import { initSocket } from './services/websocketService.js';
// import dashboardRoutes from './routes/dashboard.routes.js';
// import { initSecurityMonitoring, checkSuspiciousIP } from './services/securityMonitorService.js';
// import { initThreatIntelligence } from './services/threatIntelligenceService.js';

// const __dirname = path.resolve();
// // Initialize Express app
// const app = express();
// const server = http.createServer(app);

// // Connect to MongoDB
// connectDB();

// // Configure middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret-fallback'));

// // Apply security headers to all responses
// app.use(securityHeaders);

// // Configure CORS - critical for cookie handling across domains
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   exposedHeaders: ['Set-Cookie']
// }));

// // Request logging
// app.use(morgan('dev'));

// // IP blocking middleware - check if IP is blocked
// app.use((req, res, next) => {
//   const clientIP = req.ip || req.connection.remoteAddress;
  
//   // Skip for health check endpoint
//   if (req.path === '/health') {
//     return next();
//   }
  
//   if (isIPBlocked(clientIP)) {
//     console.log(`🚫 Blocked request from temporarily banned IP: ${clientIP}`);
//     return res.status(403).json({
//       success: false,
//       message: 'Your IP has been temporarily blocked due to suspicious activity. Please try again in 5 minutes.'
//     });
//   }
  
//   next();
// });

// // Security middleware to check suspicious IPs
// app.use(async (req, res, next) => {
//   const clientIP = req.ip || req.connection.remoteAddress;
  
//   // Skip for health check endpoint
//   if (req.path === '/health') {
//     return next();
//   }
  
//   // Check if this IP is suspicious
//   const isSuspicious = await checkSuspiciousIP(clientIP);
  
//   if (isSuspicious) {
//     console.log(`🛑 Blocked request from suspicious IP: ${clientIP}`);
//     return res.status(403).json({
//       success: false,
//       message: 'Access denied - Your IP address has been flagged as suspicious'
//     });
//   }
  
//   next();
// });

// // Apply general rate limiting to all routes
// app.use('/api', rateLimiter(100, 60, 'General API'));

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok', time: new Date().toISOString() });
// });

// // Configure API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/logs', logRoutes);
// app.use('/api/alerts', alertRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/threat-intel', threatIntelRoutes);

// // 404 & Error handling middleware
// app.use(notFound);
// app.use(errorHandler);

// // Initialize WebSocket
// initSocket(server);

// // Initialize security services
// initSecurityMonitoring();
// // Call the async initThreatIntelligence function with await in an IIFE
// (async () => {
//   try {
//     await initThreatIntelligence();
//   } catch (error) {
//     console.error('Error initializing threat intelligence:', error);
//   }
// })();

// // Run cron jobs
// cronJobs();

// app.use(express.static(path.join(__dirname, '/client/dist')));

// app.get('/*splat', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// });


// // Start Server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`Health check: http://localhost:${PORT}/health`);
// });



// backend/src/server.js
import dotenv from 'dotenv';

// Load environment variables first, before other imports
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.config.js';
import cronJobs, { isIPBlocked } from './config/cron.config.js';
import authRoutes from './routes/auth.routes.js';
import logRoutes from './routes/log.routes.js';
import alertRoutes from './routes/alert.routes.js';
import threatIntelRoutes from './routes/threatIntelligence.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { securityHeaders } from './middleware/security.middleware.js';
import { rateLimiter } from './middleware/rateLimit.middleware.js';
import { initSocket } from './services/websocketService.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { initSecurityMonitoring, checkSuspiciousIP } from './services/securityMonitorService.js';
import { initThreatIntelligence } from './services/threatIntelligenceService.js';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret-fallback'));

// Apply security headers to all responses
app.use(securityHeaders);

// Configure CORS - critical for cookie handling across domains
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

// Request logging
app.use(morgan('dev'));

// IP blocking middleware - check if IP is blocked
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Skip for health check endpoint
  if (req.path === '/health') {
    return next();
  }
  
  if (isIPBlocked(clientIP)) {
    console.log(`🚫 Blocked request from temporarily banned IP: ${clientIP}`);
    return res.status(403).json({
      success: false,
      message: 'Your IP has been temporarily blocked due to suspicious activity. Please try again in 5 minutes.'
    });
  }
  
  next();
});

// Security middleware to check suspicious IPs
app.use(async (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Skip for health check endpoint
  if (req.path === '/health') {
    return next();
  }
  
  // Check if this IP is suspicious
  const isSuspicious = await checkSuspiciousIP(clientIP);
  
  if (isSuspicious) {
    console.log(`🛑 Blocked request from suspicious IP: ${clientIP}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied - Your IP address has been flagged as suspicious'
    });
  }
  
  next();
});

// Apply general rate limiting to all routes
app.use('/api', rateLimiter(100, 60, 'General API'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Configure API Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/threat-intel', threatIntelRoutes);

// 404 & Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize WebSocket
initSocket(server);

// Initialize security services
initSecurityMonitoring();
// Call the async initThreatIntelligence function with await in an IIFE
(async () => {
  try {
    await initThreatIntelligence();
  } catch (error) {
    console.error('Error initializing threat intelligence:', error);
  }
})();

// Run cron jobs
cronJobs();

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});