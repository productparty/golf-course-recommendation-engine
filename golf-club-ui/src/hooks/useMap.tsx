// hooks/useMap.tsx
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export interface MapEvents {
    click: (event: mapboxgl.MapClickEvent) => void;
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

        const initMap = async () => {
            const newMap = await new mapboxgl.Map({
                container: mapContainer,
                style: 'mapbox://styles/yourusername/dark_mode_style', // Replace with your Mapbox style ID
                center,
                zoom: 12,
            });

            setMap(newMap);

            // Set up click handlers
            newMap.on('click', (e) => {
                if (radius && e.point.distance < radius * 1000) {
                    // Handle click within the search radius
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
    }, [center, radius]);

    return { mapContainer, map };
};