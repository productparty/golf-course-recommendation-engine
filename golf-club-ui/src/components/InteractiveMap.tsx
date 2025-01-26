// components/InteractiveMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Box } from '@mui/material';

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
    center?: [number, number];
    radius?: number;
    onMapClick?: (longitude: number, latitude: number) => void;
    onMarkerClick?: (clubId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ clubs, center, radius, onMapClick, onMarkerClick }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);  // Add this to track markers

    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize map
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: center || [-98.5795, 39.8283], // Default to US center
            zoom: 4
        });

        // Cleanup
        return () => {
            map.current?.remove();
        };
    }, []);

    // Clear markers helper
    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

    // Add markers when clubs change
    useEffect(() => {
        if (!map.current || !clubs) return;

        clearMarkers();

        clubs.forEach((club) => {
            if (club.latitude && club.longitude) {
                const marker = new mapboxgl.Marker({
                    element: createMarkerElement(club),
                    anchor: 'bottom'
                })
                .setLngLat([club.longitude, club.latitude])
                .setPopup(
                    new mapboxgl.Popup({
                        closeButton: false,
                        maxWidth: '300px'
                    }).setHTML(`
                        <div style="cursor: pointer">
                            <h3 style="margin: 0 0 8px 0">${club.club_name}</h3>
                            <p style="margin: 0">${club.address}</p>
                        </div>
                    `)
                )
                .addTo(map.current!);

                // Add click handler directly to marker
                marker.getElement().addEventListener('click', () => {
                    if (onMarkerClick) {
                        onMarkerClick(club.id);
                    }
                });

                markersRef.current.push(marker);
            }
        });

        // Fit bounds if we have clubs
        if (clubs.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            clubs.forEach((club) => {
                if (club.latitude && club.longitude) {
                    bounds.extend([club.longitude, club.latitude]);
                }
            });
            map.current.fitBounds(bounds, { padding: 50 });
        }
    }, [clubs, onMarkerClick]);

    useEffect(() => {
        if (!map.current) return;

        // Add click handler
        const handleClick = (e: mapboxgl.MapMouseEvent) => {
            if (onMapClick) {
                onMapClick(e.lngLat.lng, e.lngLat.lat);
            }
        };

        map.current.on('click', handleClick);

        return () => {
            map.current?.off('click', handleClick);
        };
    }, [onMapClick]);

    // Add this function to create custom marker elements
    const createMarkerElement = (club: Club) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = '📍'; // You can use any icon or text here
        return el;
    };

    // Cleanup
    useEffect(() => {
        return () => {
            clearMarkers();
            map.current?.remove();
        };
    }, []);

    return (
        <Box
            ref={mapContainer}
            sx={{
                height: '30vh',
                width: '100%',
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
                '& .mapboxgl-canvas': {
                    borderRadius: 1
                }
            }}
        />
    );
};