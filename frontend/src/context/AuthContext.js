// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check if user is authenticated on page load/refresh
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Skip if we've already checked
      if (initialized) return;
      
      try {
        setLoading(true);
        
        // Try to get user profile using the httpOnly cookie
        const response = await getCurrentUser();
        
        if (response.success) {
          // We're authenticated - token is in cookie, just save user data
          setAuth(response.data);
          localStorage.setItem('authUser', JSON.stringify(response.data));
        } else {
          // Not authenticated
          setAuth(null);
          localStorage.removeItem('authUser');
        }
      } catch (error) {
        // Log the error, but don't show to user - this is a background check
        if (error.isNetworkError) {
          console.warn("Auth check failed: Network error - server might be down");
        } else if (error.response?.status === 401) {
          console.log("Auth check: No valid session");
        } else {
          console.error("Auth check error:", error.message);
        }
        
        // Clear auth state on error
        setAuth(null);
        localStorage.removeItem('authUser');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkAuthStatus();
  }, [initialized]);

  const login = (userData) => {
    // We only store user data, not the token (which is in httpOnly cookie)
    setAuth(userData);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setInitialized(true);
  };

  const logout = async () => {
    try {
      // Call backend to clear the cookie
      await logoutUser();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout, but session has been cleared');
    } finally {
      // Clear local state
      setAuth(null);
      localStorage.removeItem('authUser');
    }
  };

  // Force check auth status (useful after a certain time period)
  const checkAuth = async () => {
    setInitialized(false); // This will trigger the useEffect to run again
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
