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

    // Add markers when clubs change
    useEffect(() => {
        if (!map.current || !clubs) return;

        // Clear existing markers
        const markers = document.getElementsByClassName('mapboxgl-marker');
        while (markers[0]) {
            markers[0].remove();
        }

        // Add new markers
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
                            <div style="cursor: pointer" onclick="window.dispatchEvent(new CustomEvent('markerClick', { detail: '${club.state.toLowerCase()}_${club.zip_code}_${club.club_name.toLowerCase().replace(/\s+/g, '-')}' }))">
                                <h3 style="margin: 0 0 8px 0">${club.club_name}</h3>
                                <p style="margin: 0">${club.address}</p>
                            </div>
                        `)
                    )
                    .addTo(map.current!);

                // Add click handler to marker element
                const markerElement = marker.getElement();
                markerElement.addEventListener('click', () => {
                    if (onMarkerClick) {
                        onMarkerClick(club.id);
                    }
                });
            }
        });

        // Add window event listener for popup clicks
        const handleMarkerClick = (event: CustomEvent) => {
            if (onMarkerClick) {
                onMarkerClick(event.detail);
            }
        };
        window.addEventListener('markerClick', handleMarkerClick as EventListener);

        return () => {
            window.removeEventListener('markerClick', handleMarkerClick as EventListener);
        };
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

    // Add this effect to fit bounds when clubs change
    useEffect(() => {
        if (!map.current || !clubs || clubs.length === 0) return;

        // Create bounds object
        const bounds = new mapboxgl.LngLatBounds();

        // Extend bounds with each club location
        clubs.forEach((club) => {
            if (club.latitude && club.longitude) {
                bounds.extend([club.longitude, club.latitude]);
            }
        });

        // Fit map to bounds with padding
        map.current.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 15 // Prevent zooming in too close
        });
    }, [clubs]);

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