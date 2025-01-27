// hooks/useMap.tsx
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export interface MapEvents {
    click: (event: mapboxgl.MapMouseEvent) => void;
    move: () => void;
}

export const useMap = ({
    center,
    radius,
}: {
    center: [number, number];
    radius?: number;
}) => {
    const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer) return;

        mapboxgl.accessToken = process.env.MAPBOX_TOKEN || '';

        const initMap = () => {
            const newMap = new mapboxgl.Map({
                container: mapContainer,
                style: 'mapbox://styles/mapbox/outdoors-v11', // Use a terrain style
                center,
                zoom: 14, // Zoom in closer to the club
            });

            setMap(newMap);

            // Set up click handlers
            newMap.on('click', (e) => {
                if (radius) {
                    const clickLngLat = e.lngLat;
                    const centerLngLat = new mapboxgl.LngLat(center[0], center[1]);
                    const distance = clickLngLat.distanceTo(centerLngLat); // Calculate distance in meters

                    if (distance < radius * 1000) {
                        // Handle click within the search radius
                    }
                }
            });

            // Set up move handler
            newMap.on('move', () => {
                const bounds = newMap.getBounds();
                console.log(bounds);
            });
        };

        initMap();

        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [mapContainer, center, radius]);

    return { mapContainer, map, setMapContainer };
};