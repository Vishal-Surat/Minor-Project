import { sendError } from '../utils/apiResponse.js';
import Log from '../models/Log.js';

// In-memory storage for rate limiting
// In production, you would use Redis or another shared cache
const ipRequests = new Map();

/**
 * Clears the rate limit data for an IP after a specified time
 * @param {string} ip - The IP address to clear data for
 * @param {number} ms - Milliseconds after which to clear the data
 */
const clearRateLimitData = (ip, ms) => {
  setTimeout(() => {
    ipRequests.delete(ip);
  }, ms);
};

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed in the time window
 * @param {number} timeWindow - Time window in seconds
 * @param {string} endpoint - Name of the endpoint being protected (for logging)
 */
export const rateLimiter = (maxRequests = 30, timeWindow = 60, endpoint = 'API') => {
  return async (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Create a record for this IP if it doesn't exist
    if (!ipRequests.has(clientIP)) {
      ipRequests.set(clientIP, {
        count: 0,
        firstRequest: Date.now(),
      });
      
      // Schedule cleanup after the time window
      clearRateLimitData(clientIP, timeWindow * 1000);
    }
    
    const requestData = ipRequests.get(clientIP);
    requestData.count += 1;
    
    // Check if the user has exceeded the rate limit
    if (requestData.count > maxRequests) {
      // Log the rate limit violation
      await Log.create({
        sourceIP: clientIP,
        destinationIP: req.get('host') || 'unknown',
        severity: 'high',
        message: `Rate limit exceeded on ${endpoint}: ${requestData.count} requests in ${timeWindow} seconds`,
        detectedBy: 'RateLimiter',
        status: 'active',
      });
      
      // Calculate remaining time in seconds
      const elapsedTime = Math.ceil((Date.now() - requestData.firstRequest) / 1000);
      const remainingTime = timeWindow - elapsedTime;
      
      return sendError(
        res,
        `Too many requests from this IP. Please try again in ${remainingTime} seconds.`,
        'Rate limit exceeded',
        429
      );
    }
    
    next();
  };
};

/**
 * Stricter rate limiter specifically for authentication endpoints
 */
export const authRateLimiter = rateLimiter(10, 60, 'Authentication'); 