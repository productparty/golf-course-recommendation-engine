// components/InteractiveMap.tsx
import React, { useEffect, useRef, forwardRef, useMemo } from 'react';
import { Box } from '@mui/material';
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

export const MapBounds: React.FC<{ clubs: any[] }> = ({ clubs }) => {
    const map = useMap();

    useEffect(() => {
        if (!clubs.length) return;

        if (clubs.length === 1) {
            // For single club view, zoom in closer
            const club = clubs[0];
            map.setView([club.lat || club.latitude, club.lng || club.longitude], 15);
            return;
        }

        // Original bounds logic for multiple clubs
        const bounds = new LatLngBounds(
            clubs.map(club => [
                club.latitude || 0,
                club.longitude || 0
            ] as [number, number])
        );

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView([39.8283, -98.5795], 4);
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
