// hooks/useMap.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

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
            zoom: 14
        });

        // Add marker for the club location
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