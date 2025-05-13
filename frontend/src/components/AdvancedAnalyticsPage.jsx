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
          <IncidentTimeline incidents={analyticsData?.incidents || []} />
        </div>
      </main>
    </div>
  );
};

export default AdvancedAnalyticsPage; 