/**
 * Security middleware to add various HTTP security headers
 * These headers help protect against XSS, clickjacking, MIME sniffing, etc.
 */
export const securityHeaders = (req, res, next) => {
  // Protect against XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent browsers from MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Protect against clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Set strict transport security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent external sites from embedding this site (clickjacking protection)
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'");
  
  // Set referrer policy
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // Remove Server header to avoid revealing software information
  res.setHeader('Server', '');
  
  // Log the application of security headers
  console.log(`🔒 Applied security headers to ${req.method} ${req.path}`);
  
  next();
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Result with success status and message
 */
export const validatePasswordStrength = (password) => {
  // Length check
  if (password.length < 8) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one number'
    };
  }
  
  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one special character'
    };
  }
  
  return {
    success: true,
    message: 'Password meets strength requirements'
  };
}; 