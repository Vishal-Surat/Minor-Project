import React, { useState } from 'react';

const IncidentTimeline = ({ incidents = [] }) => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  // Filter incidents based on selected filters
  const filteredIncidents = incidents.filter(incident => {
    // Time filter
    if (timeFilter === 'today') {
      const today = new Date();
      const incidentDate = new Date(incident.timestamp);
      if (incidentDate.toDateString() !== today.toDateString()) {
        return false;
      }
    } else if (timeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (new Date(incident.timestamp) < weekAgo) {
        return false;
      }
    } else if (timeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      if (new Date(incident.timestamp) < monthAgo) {
        return false;
      }
    }
    
    // Severity filter
    if (severityFilter !== 'all' && incident.severity !== severityFilter) {
      return false;
    }
    
    return true;
  });
  
  // Group incidents by date
  const groupedIncidents = filteredIncidents.reduce((groups, incident) => {
    const date = new Date(incident.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(incident);
    return groups;
  }, {});
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedIncidents).sort((a, b) => {
    return new Date(b) - new Date(a);
  });
  
  const renderSeverityBadge = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[severity] || 'bg-gray-100 text-gray-800'}`}>
        {severity}
      </span>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Incident Timeline</h3>
        <p className="text-sm text-gray-500">Chronological view of security events</p>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        
        {sortedDates.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {sortedDates.map((date, dateIndex) => (
                <li key={date}>
                  <div className="relative pb-8">
                    {dateIndex !== sortedDates.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{date}</p>
                        </div>
                        <div className="mt-2">
                          {groupedIncidents[date].map((incident) => (
                            <div key={incident.id} className="mb-4 bg-gray-50 p-3 rounded-md">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-900">{incident.message}</p>
                                <div className="ml-2">
                                  {renderSeverityBadge(incident.severity)}
                                </div>
                              </div>
                              <div className="mt-2 flex justify-between text-xs text-gray-500">
                                <div>
                                  <span>Source: {incident.sourceIP}</span>
                                  {incident.destinationIP && (
                                    <span> → {incident.destinationIP}</span>
                                  )}
                                </div>
                                <div>
                                  {new Date(incident.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No incidents match the selected filters
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentTimeline; 