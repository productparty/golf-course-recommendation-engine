// components/InteractiveMap.tsx
import { useState, useEffect } from 'react';
import { useMap } from './hooks/useMap';

interface Club {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

interface InteractiveMapProps {
    clubs?: Club[];
    center: [number, number];
    radius?: number;
}

export const InteractiveMap = ({ clubs, center, radius }: InteractiveMapProps) => {
    const { mapContainer, map } = useMap({ center, radius });

    useEffect(() => {
        if (!map || !clubs) return;

        // Add markers for each club
        clubs.forEach((club) => {
            const marker = new mapboxgl.Marker()
                .setLngLat([club.longitude, club.latitude])
                .setPopup(
                    new mapboxgl.Popup().setHTML(`
                        <h3 class="popup-title">${club.name}</h3>
                        <p class="popup-content">${club.address}</p>
                    `)
                )
                .addTo(map);
        });

        // Add radius circle (if applicable)
        if (radius) {
            const circleSource = map.getSource('search-radius') as mapboxgl.GeoJSONSource;
            if (!circleSource) {
                const circle = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: {
                            type: 'Circle',
                            coordinates: center,
                            radius: radius * 1000, // Convert to meters
                        },
                    }],
                };

                map.addLayer({
                    id: 'radius-layer',
                    type: 'circle',
                    source: 'search-radius',
                    geometry: ['get', 'geometry'],
                    properties: {},
                    layout: {
                        'visibility': 'visible',
                    },
                    paint: {
                        'circle-color': '#3498db',
                        'circle-radius': [ 'interpolate', [ 'linear' ], [ 'literal', 1 ], 0, 500, 500 ]
                    }
                });
            } else {
                // Update the circle source
                map.getSource('search-radius').setData(circle);
            }
        }
    }, [map, clubs, center, radius]);

    return (
        <>
            {mapContainer}
            <div className="search-form">
                <input
                    type="text"
                    placeholder="Enter location..."
                    // Add your search logic here
                />
                <input
                    type="range"
                    min="5000"  // Minimum radius in meters (5km)
                    max="20000" // Maximum radius in meters (20km)
                    step="1000"
                    value={radius || 10000}
                />
            </div>
        </>
    );
};