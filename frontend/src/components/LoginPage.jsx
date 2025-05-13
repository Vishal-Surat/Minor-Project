// src/components/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const navigate = useNavigate();
  const { login, auth } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (auth) {
      navigate('/dashboard');
    }
  }, [auth, navigate]);

  // Countdown timer for locked accounts
  useEffect(() => {
    let interval;
    if (isAccountLocked && lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setIsAccountLocked(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAccountLocked, lockoutTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting login with:', { email });
      const response = await loginUser({ email, password });
      console.log('Login response:', response);

      if (response && response.success) {
        // The JWT is stored in httpOnly cookie by the server
        // We only need to store the user data locally
        login(response.data.user);
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        setError(response?.message || 'Login failed');
        toast.error(response?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error details:', err);
      
      // Handle account lockout
      if (err.response?.status === 403 && err.response?.data?.message?.includes('Account is temporarily locked')) {
        // Extract minutes from the error message (e.g., "Please try again in 5 minutes")
        const minutesMatch = err.response.data.message.match(/try again in (\d+)/);
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 5;
        
        setIsAccountLocked(true);
        setLockoutTimer(minutes * 60); // Convert minutes to seconds
        setError(`Account is temporarily locked due to too many failed attempts. Please try again in ${minutes} minutes.`);
        toast.error('Account locked: Too many failed attempts');
      } else if (err.response?.status === 403 && err.response?.data?.message?.includes('Too many failed login attempts')) {
        // Account just got locked
        setIsAccountLocked(true);
        setLockoutTimer(5 * 60); // 5 minutes in seconds
        setError('Too many failed login attempts. Account locked for 5 minutes.');
        toast.error('Account locked: Too many failed attempts');
      } else if (err.isNetworkError) {
        // Handle network errors
        setError('Network error: Unable to connect to the server');
        toast.error('Network error: Unable to connect to the server');
      } else {
        // Handle regular API errors
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            'Invalid credentials';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Security Dashboard Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
            {isAccountLocked && lockoutTimer > 0 && (
              <div className="mt-2 text-center">
                <span className="font-medium">Remaining time: </span>
                <span className="font-bold">{formatTime(lockoutTimer)}</span>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isAccountLocked && lockoutTimer > 0}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isAccountLocked && lockoutTimer > 0}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out
                ${isAccountLocked && lockoutTimer > 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              disabled={loading || (isAccountLocked && lockoutTimer > 0)}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : isAccountLocked && lockoutTimer > 0 ? (
                'Account Locked'
              ) : (
                'Log In'
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
