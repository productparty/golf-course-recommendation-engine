// components/InteractiveMap.tsx
import React, { useEffect, useRef, forwardRef } from 'react';
import { Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { LatLngBounds, LatLng } from 'leaflet';

interface Club {
    id: string;
    club_name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    state: string;
    zip_code: string;
}

interface InteractiveMapProps {
    clubs: Club[];
    center: [number, number];
    radius: number;
    onMapClick?: (lngLat: [number, number]) => void;
    onMarkerClick: (clubId: string) => void;
    showNumbers?: boolean;
    initialZoom?: number;
    children?: React.ReactNode;
}

// Create a custom HTML element for each marker
function createNumberedMarker(number: number) {
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = `<div class="marker-number">${number}</div>`;
    return el;
}

// Add validation function
const isValidCoordinate = (lat: number, lng: number) => 
  !isNaN(lat) && !isNaN(lng) && 
  lat >= -90 && lat <= 90 && 
  lng >= -180 && lng <= 180;

// Add this component to handle bounds
const MapBounds: React.FC<{ clubs: Club[] }> = ({ clubs }) => {
  const map = useMap();
  useEffect(() => {
    if (clubs.length > 0) {
      const bounds = new LatLngBounds([]);
      clubs.forEach((club) => {
        if (club.latitude && club.longitude && isValidCoordinate(club.latitude, club.longitude)) {
          bounds.extend(new LatLng(club.latitude, club.longitude));
        }
      });

      // Check if bounds are valid before fitting
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        // Optionally, set a default view if no valid bounds
         map.setView([39.8283, -98.5795], 4); // Example: Center of US, zoom level 4
      }
    }
  }, [clubs, map]);

  return null;
};

export const InteractiveMap = forwardRef<HTMLDivElement, InteractiveMapProps>(({
  clubs,  // This will now be getPaginatedClubs instead of all clubs
  center,
  initialZoom = 14,
  children
}, ref) => {
  return (
    <Box ref={ref} sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ height: '400px', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
        <MapContainer 
          center={center} 
          zoom={initialZoom} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapBounds clubs={clubs} />
          {children}
        </MapContainer>
      </Box>
    </Box>
  );
});

InteractiveMap.displayName = 'InteractiveMap';

export default InteractiveMap;
