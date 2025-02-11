// components/InteractiveMap.tsx
import React, { useEffect, useRef, forwardRef } from 'react';
import { Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export const InteractiveMap = forwardRef<HTMLDivElement, InteractiveMapProps>(({
  clubs,
  center,
  radius,
  onMapClick,
  onMarkerClick,
  showNumbers = false,
  initialZoom = 14
}, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);
    const markers = useRef<L.Marker[]>([]);

    useEffect(() => {
        console.log("InteractiveMap useEffect - mapContainer:", mapContainer.current);
        if (!mapContainer.current) return;

        // Initialize map if it doesn't exist
        if (!map.current) {
            console.log("InteractiveMap - Initializing map");
            map.current = L.map(mapContainer.current, {
                center: [center[1], center[0]], // Leaflet uses [lat, long]
                zoom: initialZoom,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map.current);
        }

        // Clear existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Add new markers
        clubs.forEach((club, index) => {
            if (club.latitude && club.longitude && 
                isValidCoordinate(club.latitude, club.longitude)) {
                const el = showNumbers ? createNumberedMarker(index + 1) : undefined;
                const marker = L.marker([club.latitude, club.longitude], {
                    icon: el ? L.divIcon({ className: '', html: el.outerHTML }) : undefined
                })
                    .addTo(map.current!)
                    .bindPopup(club.club_name)
                    .on('click', () => onMarkerClick(club.id));

                markers.current.push(marker);
            }
        });

        // Fit bounds to markers
        if (clubs.length > 0 && clubs.some(club => club.longitude && club.latitude) && map.current) {
            const markerCoordinates = clubs
                .filter(club => club.latitude && club.longitude)
                .map(club => L.latLng(club.latitude!, club.longitude!));
            if (markerCoordinates.length > 0) {
                const bounds = L.latLngBounds(markerCoordinates);
                map.current.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        // Add click handler
        map.current?.on('click', (e: L.LeafletMouseEvent) => {
            onMapClick && onMapClick([e.latlng.lat, e.latlng.lng]);
        });

        return () => {
            if (map.current) {
                console.log("InteractiveMap - Removing map");
                map.current.remove();
                map.current = null;
            }
        };
    }, [mapContainer.current, clubs, center, showNumbers, initialZoom]);

    useEffect(() => {
        if (center && map.current) {
            // Update marker position
            if (markers.current.length > 0) {
                markers.current.forEach(marker => marker.setLatLng(center));
            } else {
                markers.current.push(L.marker(center).addTo(map.current));
            }
        }
    }, [center]);

    return (
        <Box ref={ref} sx={{ height: '100%', width: '100%' }}>
            <Box
                ref={mapContainer}
                sx={{
                    height: '400px',
                    width: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            />
        </Box>
    );
});

InteractiveMap.displayName = 'InteractiveMap';

export default InteractiveMap;
