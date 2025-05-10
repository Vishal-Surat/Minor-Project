import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import IncidentTimeline from './IncidentTimeline';
import { useAuth } from '../context/AuthContext';
import { fetchAdvancedAnalytics } from '../services/api';

const AdvancedAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(7);
  const [darkMode, setDarkMode] = useState(false);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!auth && !loading) {
      navigate('/login');
    }
  }, [auth, navigate, loading]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchAdvancedAnalytics(timeRange);
      
      if (response.success) {
        setAnalyticsData(response.data);
        setError('');
      } else {
        setError(response.message || 'Failed to fetch analytics data');
        toast.error(response.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || 'Error fetching analytics data';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, logout, timeRange]);

  useEffect(() => {
    fetchData();
    
    // Set up refresh interval (every 15 seconds)
    const intervalId = setInterval(fetchData, 15000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading && !analyticsData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-700">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchData} 
            className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Sample incidents for the timeline (in a real implementation, this would come from the backend)
  const sampleIncidents = [
    {
      id: '1',
      message: 'Brute force attack detected',
      sourceIP: '192.168.1.100',
      destinationIP: '10.0.0.5',
      severity: 'critical',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
    },
    {
      id: '2',
      message: 'Suspicious login attempt',
      sourceIP: '172.16.0.25',
      destinationIP: '10.0.0.10',
      severity: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      id: '3',
      message: 'Malware detected',
      sourceIP: '192.168.5.10',
      destinationIP: '10.0.0.15',
      severity: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    },
    {
      id: '4',
      message: 'Port scanning activity',
      sourceIP: '45.33.25.121',
      destinationIP: '10.0.0.1',
      severity: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 hours ago
    },
    {
      id: '5',
      message: 'Failed login attempt',
      sourceIP: '192.168.1.50',
      destinationIP: '10.0.0.20',
      severity: 'low',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    },
    {
      id: '6',
      message: 'DDoS attack mitigated',
      sourceIP: 'Multiple',
      destinationIP: '10.0.0.100',
      severity: 'critical',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3 hours ago
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
            <nav className="flex space-x-4">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                to="/advanced-analytics" 
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-blue-600"
              >
                Advanced Analytics
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {auth && (
              <span className="text-gray-600">Welcome, {auth.name}</span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Advanced Analytics</h2>
          <p className="text-sm text-gray-500">Detailed security insights and threat visualization</p>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={1}>Last 24 Hours</option>
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
            </div>
            <div className="ml-auto">
              <button
                onClick={fetchData}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Security Posture Score</h3>
              <p className="text-sm text-gray-500">Overall security health assessment</p>
            </div>
            <div className="p-4">
              <div className="flex justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    ></circle>
                    <circle
                      className="text-blue-600 progress-ring__circle stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - 0.78)}
                      transform="rotate(-90 50 50)"
                    ></circle>
                    <text
                      x="50"
                      y="50"
                      fontFamily="Verdana"
                      fontSize="20"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      className="fill-current text-gray-800"
                    >
                      78/100
                    </text>
                  </svg>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="bg-green-100 p-2 rounded">
                  <p className="text-sm font-medium text-green-800">Access Control</p>
                  <p className="text-lg font-bold text-green-800">92%</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded">
                  <p className="text-sm font-medium text-yellow-800">Network Security</p>
                  <p className="text-lg font-bold text-yellow-800">76%</p>
                </div>
                <div className="bg-orange-100 p-2 rounded">
                  <p className="text-sm font-medium text-orange-800">Endpoint Security</p>
                  <p className="text-lg font-bold text-orange-800">68%</p>
                </div>
                <div className="bg-blue-100 p-2 rounded">
                  <p className="text-sm font-medium text-blue-800">Data Protection</p>
                  <p className="text-lg font-bold text-blue-800">85%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <IncidentTimeline incidents={sampleIncidents} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Threat Intelligence Feed</h3>
              <p className="text-sm text-gray-500">Latest security advisories and threats</p>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                <li className="py-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                        <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Critical Vulnerability in OpenSSL</p>
                      <p className="text-xs text-gray-500">30 minutes ago</p>
                      <p className="mt-1 text-sm text-gray-600">New zero-day vulnerability affecting OpenSSL versions 1.1.1 through 1.1.1k</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-100">
                        <svg className="h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Ransomware Campaign Targeting Healthcare</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                      <p className="mt-1 text-sm text-gray-600">New ransomware variant targeting healthcare organizations through phishing emails</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
                        <svg className="h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">APT Group Activity Detected</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                      <p className="mt-1 text-sm text-gray-600">Increased activity from APT29 targeting government organizations</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvancedAnalyticsPage; 