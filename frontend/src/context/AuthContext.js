import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, checkAuth } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await checkAuth();
        if (response.success) {
          setAuth(response.data);
        } else {
          setAuth(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      if (response.success) {
        setAuth(response.data);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setAuth(null);
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Logout failed'
      };
    }
  };

  const value = {
    auth,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 