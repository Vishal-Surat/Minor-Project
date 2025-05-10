import Alert from '../models/Alert.js';
import Log from '../models/Log.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Store the last generated random values with timestamps
let lastGeneratedData = {
  timestamp: Date.now(),
  low: Math.floor(Math.random() * 20) + 10,
  medium: Math.floor(Math.random() * 15) + 5,
  high: Math.floor(Math.random() * 10) + 3,
  critical: Math.floor(Math.random() * 5) + 1
};

// Function to generate random increments
const generateRandomIncrements = () => {
  return {
    low: Math.floor(Math.random() * 5),
    medium: Math.floor(Math.random() * 4),
    high: Math.floor(Math.random() * 3),
    critical: Math.random() > 0.7 ? 1 : 0 // 30% chance of critical increment
  };
};

export const getDashboardData = asyncHandler(async (req, res) => {
  try {
    // Get the latest 10 logs
    const recentLogs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get the latest 10 alerts
    const recentAlerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Check if 15 seconds have passed since last data generation
    const currentTime = Date.now();
    if (currentTime - lastGeneratedData.timestamp >= 15000) {
      // Generate increments
      const increments = generateRandomIncrements();
      
      // Update the values
      lastGeneratedData = {
        timestamp: currentTime,
        low: lastGeneratedData.low + increments.low,
        medium: lastGeneratedData.medium + increments.medium,
        high: lastGeneratedData.high + increments.high,
        critical: lastGeneratedData.critical + increments.critical
      };
    }
    
    // Create fake severity counts using the stored random values
    const fakeSeverityCounts = [
      { _id: 'low', count: lastGeneratedData.low },
      { _id: 'medium', count: lastGeneratedData.medium },
      { _id: 'high', count: lastGeneratedData.high },
      { _id: 'critical', count: lastGeneratedData.critical }
    ];
    
    // Format graph data properly
    const graphData = {
      labels: ["low", "medium", "high", "critical"],
      datasets: [
        {
          label: 'Severity Distribution',
          data: fakeSeverityCounts.map(item => ({
            severity: item._id,
            count: item.count
          })),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
        }
      ]
    };
    
    // Get IP flows data from logs
    const ipFlows = await Log.aggregate([
      { $project: { sourceIP: 1, destinationIP: 1, severity: 1 } },
      { $limit: 20 }
    ]);
    
    // Format the data for frontend
    const dashboardData = {
      graphData,
      liveThreats: recentAlerts.map(alert => ({
        id: alert._id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        type: alert.type,
        timestamp: alert.createdAt
      })),
      ipFlows: ipFlows.map(flow => ({
        source: flow.sourceIP,
        destination: flow.destinationIP,
        severity: flow.severity
      })),
      recentActivity: recentLogs.map(log => ({
        id: log._id,
        message: log.message,
        sourceIP: log.sourceIP,
        destinationIP: log.destinationIP,
        severity: log.severity,
        timestamp: log.createdAt
      }))
    };
    
    return sendSuccess(res, dashboardData, 'Dashboard data fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 'Failed to fetch dashboard data');
  }
});
  