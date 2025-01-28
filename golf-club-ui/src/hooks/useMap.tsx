// hooks/useMap.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import { config } from '../config';

interface UseMapProps {
    center: [number, number];
    radius?: number;
}

export const useMap = ({ center, radius }: UseMapProps) => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!mapContainer || !center[0] || !center[1]) return;

        mapboxgl.accessToken = config.MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
            container: mapContainer,
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: center,
            zoom: 14,
            fitBoundsOptions: {
                padding: 50  // Add padding around the centered point
            }
        });

        // Add marker at the center
        new mapboxgl.Marker()
            .setLngLat(center)
            .addTo(map);

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl());

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [mapContainer, center]);

    return { mapContainer, setMapContainer, map: mapRef.current };
};