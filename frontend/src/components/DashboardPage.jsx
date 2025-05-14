// src/components/DashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import GraphSection from './GraphSection';
import LiveThreatFeed from './LiveThreatFeed';
import IPFlowMap from './IPFlowMap';
import NotificationBanner from './NotificationBanner';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardData } from '../services/api';

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

      <NotificationBanner />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">System Overview</h2>
          <p className="text-sm text-gray-500">Real-time security metrics and threat analysis</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData && (
            <>
              <GraphSection data={dashboardData.graphData} />
              <LiveThreatFeed threats={dashboardData.liveThreats} />
              <IPFlowMap
                ipData={Array.from({ length: 50 }, (_, i) => ({
                  source: `192.168.1.${(i % 20) + 1}`,
                  destination: `10.0.0.${(i % 20) + 1}`,
                  severity: ['low', 'medium', 'high', 'critical'][i % 4]
                }))}
              />
              
              {/* Add a new section for recent activity */}
              <div className="bg-white rounded-lg shadow overflow-hidden col-span-full mt-6">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-4">
                  {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.recentActivity.map((activity) => (
                            <tr key={activity.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.message}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.sourceIP}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.destinationIP}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${activity.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                                    activity.severity === 'high' ? 'bg-orange-100 text-orange-800' : 
                                    activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-green-100 text-green-800'}`}>
                                  {activity.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent activity found.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
