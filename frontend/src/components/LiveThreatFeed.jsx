// src/components/LiveThreatFeed.jsx
import React from 'react';

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'intrusion':
      return '🛡️';
    case 'malware':
      return '🦠';
    case 'phishing':
      return '🎣';
    case 'unauthorized-access':
      return '🔑';
    case 'dos':
      return '⚡';
    default:
      return '⚠️';
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
};

const LiveThreatFeed = ({ threats = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Live Threat Feed</h3>
        <p className="text-sm text-gray-500">Recent security alerts</p>
      </div>
      
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {threats && threats.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {threats.map((threat) => (
              <li key={threat.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-xl mr-2">
                    {getTypeIcon(threat.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {threat.title}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {threat.description}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {formatDate(threat.timestamp)}
                      </span>
                      <span className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                        Details
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500">No threats detected</p>
            <p className="text-sm text-gray-400 mt-1">System is monitoring for security events</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveThreatFeed;
