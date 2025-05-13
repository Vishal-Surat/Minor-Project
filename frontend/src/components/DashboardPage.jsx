import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardData } from '../services/api';
import IPFlowMap from './IPFlowMap';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      const response = await fetchDashboardData();
      
      if (response.success) {
        setDashboardData(response.data);
        setError('');
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
        toast.error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || 'Error fetching dashboard data';
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
  }, [navigate, logout]);

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

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
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
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-blue-600"
              >
                Dashboard
              </Link>
              <Link 
                to="/advanced-analytics" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
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
          <h2 className="text-lg font-medium text-gray-900">Security Overview</h2>
          <p className="text-sm text-gray-500">Real-time security monitoring and threat detection</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Alerts</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardData?.totalAlerts || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Critical Threats</h3>
            <p className="text-3xl font-bold text-red-600">{dashboardData?.criticalThreats || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Blocked IPs</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData?.blockedIPs || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Health</h3>
            <p className="text-3xl font-bold text-purple-600">{dashboardData?.systemHealth || 'Good'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">IP Flow Map</h3>
            <div className="h-96">
              <IPFlowMap ipData={dashboardData?.ipFlowData || []} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Alerts</h3>
            <div className="space-y-4">
              {dashboardData?.recentAlerts?.map((alert, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-500">{alert.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{alert.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              {dashboardData?.systemStatus?.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{status.name}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    status.status === 'operational' ? 'bg-green-100 text-green-800' :
                    status.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 