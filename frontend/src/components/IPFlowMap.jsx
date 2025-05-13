import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

// Mock function to get IP location (replace with actual API call)
const getIPLocation = (ip) => {
  // This is a mock function - replace with actual IP geolocation API
  const mockLocations = {
    '192.168.1.1': { lat: 40.7128, lng: -74.0060 }, // New York
    '10.0.0.1': { lat: 34.0522, lng: -118.2437 },   // Los Angeles
    '172.16.0.1': { lat: 51.5074, lng: -0.1278 },   // London
    '8.8.8.8': { lat: 37.7749, lng: -122.4194 },    // San Francisco
  };
  return mockLocations[ip] || { lat: 0, lng: 0 };
};

const IPFlowMap = ({ ipData }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [leafletInstance, setLeafletInstance] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    fixLeafletIcon();
    const mapInstance = L.map(mapRef.current).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    setMap(mapInstance);
    setLeafletInstance(L);
    setMapLoaded(true);

    return () => {
      mapInstance.remove();
    };
  }, [map, mapLoaded]);

  // Update markers when IP data changes
  useEffect(() => {
    if (!map || !leafletInstance || !ipData) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    const newMarkers = [];

    // Add new markers
    ipData.forEach(flow => {
      const sourceLocation = getIPLocation(flow.sourceIP);
      const destLocation = getIPLocation(flow.destIP);

      // Create source marker
      const sourceMarker = leafletInstance.marker([sourceLocation.lat, sourceLocation.lng])
        .bindPopup(`Source IP: ${flow.sourceIP}`)
        .addTo(map);
      newMarkers.push(sourceMarker);

      // Create destination marker
      const destMarker = leafletInstance.marker([destLocation.lat, destLocation.lng])
        .bindPopup(`Destination IP: ${flow.destIP}`)
        .addTo(map);
      newMarkers.push(destMarker);

      // Create flow line
      const flowLine = leafletInstance.polyline(
        [[sourceLocation.lat, sourceLocation.lng], [destLocation.lat, destLocation.lng]],
        {
          color: flow.threatLevel === 'high' ? 'red' : flow.threatLevel === 'medium' ? 'orange' : 'green',
          weight: 2,
          opacity: 0.7
        }
      ).addTo(map);
      newMarkers.push(flowLine);
    });

    setMarkers(newMarkers);
  }, [map, leafletInstance, ipData, markers]);

  return (
    <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
  );
};

export default IPFlowMap; 