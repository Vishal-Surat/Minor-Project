// src/components/IPFlowMap.jsx
import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Mock IP to location mapping for demo purposes
// In a real app, you'd use GeoIP service or similar
const mockIpLocations = {
  getLocation: (ip) => {
    // Generate deterministic random coordinates based on IP
    const ipSum = ip.split('.').reduce((sum, num) => sum + parseInt(num, 10), 0);
    const lat = (ipSum % 180) - 90;
    const lng = (ipSum % 360) - 180;
    
    return {
      lat,
      lng,
      location: `${lat.toFixed(2)}, ${lng.toFixed(2)}`
    };
  }
};

const IPFlowMap = ({ ipData = [] }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [leafletInstance, setLeafletInstance] = useState(null);

  // Generate 50 demo flows if ipData is empty
  const demoFlows = Array.from({ length: 50 }, (_, i) => ({
    source: `192.168.1.${(i % 20) + 1}`,
    destination: `10.0.0.${(i % 20) + 1}`,
    severity: ['low', 'medium', 'high', 'critical'][i % 4]
  }));

  const flows = (ipData && ipData.length > 0) ? ipData : demoFlows;

  // Initialize map on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Import leaflet dynamically to avoid SSR issues
      const loadLeaflet = async () => {
        try {
          const L = await import('leaflet');
          setLeafletInstance(L.default || L);
          
          if (!mapLoaded && !map) {
            // Create map if it doesn't exist
            const mapInstance = L.default.map('ipmap', {
              center: [20, 0],
              zoom: 2,
              minZoom: 2
            });
            
            // Add tile layer
            L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance);
            
            setMap(mapInstance);
            setMapLoaded(true);
          }
        } catch (error) {
          console.error('Error loading Leaflet:', error);
        }
      };
      
      loadLeaflet();
    }
    
    // Cleanup on unmount
    return () => {
      if (map) {
        map.remove();
      }
    };
  });

  // Update markers when ipData changes
  useEffect(() => {
    // Only proceed if we have the map and Leaflet instance
    if (map && leafletInstance && flows && flows.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.remove());
      const newMarkers = [];
      
      // Add source and destination markers
      flows.forEach(flow => {
        try {
          // Get source location
          const sourceLocation = mockIpLocations.getLocation(flow.source);
          
          // Get destination location
          const destinationLocation = mockIpLocations.getLocation(flow.destination);
          
          // Create source marker
          const sourceMarker = leafletInstance.marker([sourceLocation.lat, sourceLocation.lng])
            .addTo(map)
            .bindPopup(`
              <strong>Source IP:</strong> ${flow.source}<br>
              <strong>Location:</strong> ${sourceLocation.location}<br>
              <strong>Severity:</strong> ${flow.severity || 'unknown'}
            `);
          
          // Create destination marker
          const destMarker = leafletInstance.marker([destinationLocation.lat, destinationLocation.lng])
            .addTo(map)
            .bindPopup(`
              <strong>Destination IP:</strong> ${flow.destination}<br>
              <strong>Location:</strong> ${destinationLocation.location}<br>
              <strong>Severity:</strong> ${flow.severity || 'unknown'}
            `);
          
          // Draw line between source and destination
          const line = leafletInstance.polyline(
            [[sourceLocation.lat, sourceLocation.lng], [destinationLocation.lat, destinationLocation.lng]],
            {
              color: flow.severity === 'critical' ? 'red' : 
                     flow.severity === 'high' ? 'orange' : 
                     flow.severity === 'medium' ? 'yellow' : 'blue',
              weight: 2,
              opacity: 0.7,
              dashArray: '5, 5'
            }
          ).addTo(map);
          
          newMarkers.push(sourceMarker, destMarker, line);
        } catch (error) {
          console.error('Error adding IP flow to map:', error);
        }
      });
      
      setMarkers(newMarkers);
    }
  }, [markers ,map, leafletInstance, flows]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">IP Flow Map</h3>
        <p className="text-sm text-gray-500">Network traffic visualization</p>
      </div>
      <div className="p-4">
        <div id="ipmap" style={{ height: '300px', width: '100%', borderRadius: '4px' }}></div>
        {(!flows || flows.length === 0) && (
          <div className="text-center py-4 text-gray-500">
            No IP flow data available
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          Showing {flows?.length || 0} network connections
        </div>
      </div>
    </div>
  );
};

export default IPFlowMap;
