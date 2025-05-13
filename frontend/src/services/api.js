// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor 
api.interceptors.request.use(
  (config) => {
    // Make sure withCredentials is always set to true for all requests
    config.withCredentials = true;
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Success case - return the data
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error: Unable to connect to the API server', error);
      return Promise.reject({
        message: 'Network Error: Please check your internet connection or the server may be down',
        isNetworkError: true,
        originalError: error
      });
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      return Promise.reject({
        message: 'Server Error: The server encountered an error, please try again later',
        originalError: error.response.data
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      console.error('Authentication Error:', error.response.data);
      
      // Clear local storage if we get an unauthorized error
      localStorage.removeItem('authUser');
    }
    
    // Return the error response data if available
    if (error.response.data) {
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// ----------------- Auth APIs -------------------
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

// ----------------- Logs / Alerts / etc. -------------------
export const fetchLogs = () => api.get('/logs');
export const fetchAlerts = () => api.get('/alerts');
export const fetchSessions = () => api.get('/logs/sessions');
export const fetchAuditLogs = () => api.get('/logs/audit');
export const fetchNotifications = () => api.get('/alerts/notifications');

// ----------------- Dashboard API -------------------
export const fetchDashboardData = () => api.get('/dashboard');

// ----------------- Advanced Analytics API -------------------
/**
 * Fetch advanced analytics data
 * @param {number} days - Number of days of data to return (default: 7)
 * @returns {Promise<Object>} - Advanced analytics data
 */
export const fetchAdvancedAnalytics = async (days = 7) => {
  try {
    // For now, we'll reuse the dashboard endpoint but in a real implementation
    // this would be a separate endpoint with more detailed analytics data
    const response = await api.get(`/dashboard?days=${days}`);
    return response;
  } catch (error) {
    console.error('Error fetching advanced analytics data:', error);
    throw error;
  }
};

// ----------------- Threat Intelligence API -------------------
/**
 * Fetch threat intelligence dashboard data
 * @param {number} days - Number of days of data to return (default: 7)
 * @returns {Promise<Object>} - Threat intelligence data
 */
export const fetchThreatIntelData = async (days = 7) => {
  try {
    const response = await api.get(`/threat-intel/dashboard?days=${days}`);
    return response;
  } catch (error) {
    console.error('Error fetching threat intel data:', error);
    throw error;
  }
};

/**
 * Check IP reputation against AlienVault OTX
 * @param {string} ip - IP address to check
 * @returns {Promise<Object>} - IP reputation data
 */
export const checkIPReputation = async (ip) => {
  try {
    const response = await api.get(`/threat-intel/ip/${ip}`);
    return response;
  } catch (error) {
    console.error('Error checking IP reputation:', error);
    throw error;
  }
};

/**
 * Check domain reputation against AlienVault OTX
 * @param {string} domain - Domain to check
 * @returns {Promise<Object>} - Domain reputation data
 */
export const checkDomainReputation = async (domain) => {
  try {
    const response = await api.get(`/threat-intel/domain/${domain}`);
    return response;
  } catch (error) {
    console.error('Error checking domain reputation:', error);
    throw error;
  }
};

/**
 * Get recent threats from AlienVault OTX
 * @param {number} limit - Number of threats to retrieve (default: 10)
 * @returns {Promise<Array>} - Recent threats
 */
export const getRecentThreats = async (limit = 10) => {
  try {
    const response = await api.get(`/threat-intel/recent?limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Error fetching recent threats:', error);
    throw error;
  }
};

/**
 * Get all suspicious IPs
 * @returns {Promise<Array>} - List of suspicious IPs
 */
export const getSuspiciousIPs = async () => {
  try {
    const response = await api.get('/threat-intel/suspicious-ips');
    return response;
  } catch (error) {
    console.error('Error fetching suspicious IPs:', error);
    throw error;
  }
};

/**
 * Get all suspicious domains
 * @returns {Promise<Array>} - List of suspicious domains
 */
export const getSuspiciousDomains = async () => {
  try {
    const response = await api.get('/threat-intel/suspicious-domains');
    return response;
  } catch (error) {
    console.error('Error fetching suspicious domains:', error);
    throw error;
  }
};

/**
 * Add a new suspicious IP
 * @param {Object} ipData - Data about the suspicious IP
 * @returns {Promise<Object>} - The created suspicious IP
 */
export const addSuspiciousIP = async (ipData) => {
  try {
    const response = await api.post('/threat-intel/suspicious-ips', ipData);
    return response;
  } catch (error) {
    console.error('Error adding suspicious IP:', error);
    throw error;
  }
};

/**
 * Add a new suspicious domain
 * @param {Object} domainData - Data about the suspicious domain
 * @returns {Promise<Object>} - The created suspicious domain
 */
export const addSuspiciousDomain = async (domainData) => {
  try {
    const response = await api.post('/threat-intel/suspicious-domains', domainData);
    return response;
  } catch (error) {
    console.error('Error adding suspicious domain:', error);
    throw error;
  }
};

export default api;
