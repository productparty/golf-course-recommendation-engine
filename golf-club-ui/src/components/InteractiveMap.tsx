// components/InteractiveMap.tsx
import React, { useEffect, useRef } from 'react';
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

// Create a custom HTML element for each marker
function createNumberedMarker(number: number) {
  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.innerHTML = `<span>${number}</span>`;
  el.style.backgroundColor = '#3FB1CE';
  el.style.width = '30px';
  el.style.height = '30px';
  el.style.borderRadius = '50%';
  el.style.display = 'flex';
  el.style.justifyContent = 'center';
  el.style.alignItems = 'center';
  el.style.color = 'white';
  el.style.fontWeight = 'bold';
  return el;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ clubs, center, radius, onMapClick, onMarkerClick }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

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

        // Add zoom and rotation controls to the map.
        map.current.addControl(new mapboxgl.NavigationControl());

        // Display zoom level
        map.current.on('zoom', () => {
            const zoomLevel = map.current?.getZoom().toFixed(2);
            console.log(`Current Zoom Level: ${zoomLevel}`);
        });

        // Cleanup
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null; // Ensure map is set to null after removal
            }
        };
    }, [center]);

    // Clear markers helper
    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

    // Add markers when clubs change
    useEffect(() => {
        if (!map.current || !clubs || clubs.length === 0) return;

        clearMarkers();

        const validClubs = clubs.filter(club => club.latitude !== undefined && club.longitude !== undefined);
        if (validClubs.length === 0) return; // Exit if no valid clubs

        validClubs.forEach((club, index) => {
            const el = createNumberedMarker(index + 1);
            if (club.longitude !== undefined && club.latitude !== undefined) {
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([club.longitude, club.latitude])
                    .setPopup(
                        new mapboxgl.Popup({
                            closeButton: false,
                            maxWidth: '300px'
                        }).setHTML(`
                            <div style="cursor: pointer">
                                <h3 style="margin: 0 0 8px 0">${index + 1}. ${club.club_name}</h3>
                                <p style="margin: 0">${club.address}</p>
                            </div>
                        `)
                    )
                    .addTo(map.current!);

                marker.getElement().addEventListener('click', () => {
                    if (onMarkerClick) {
                        onMarkerClick(club.id);
                    }
                });

                markersRef.current.push(marker);
            }
        });

        // Fit bounds only if there are valid clubs
        if (validClubs.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            validClubs.forEach((club) => {
                if (club.longitude !== undefined && club.latitude !== undefined) {
                    bounds.extend([club.longitude, club.latitude]);
                }
            });
            map.current.fitBounds(bounds, { padding: 50 });
        }

        map.current.on('load', () => {
            map.current!.addSource('clubs', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: validClubs.map(club => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [club.longitude!, club.latitude!]
                        },
                        properties: {
                            id: club.id,
                            name: club.club_name
                        }
                    }))
                },
                cluster: true,
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 50 // Radius of each cluster when clustering points
            });

            map.current!.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'clubs',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#51bbd6',
                    'circle-radius': 20
                }
            });

            map.current!.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'clubs',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });

            map.current!.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'clubs',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#11b4da',
                    'circle-radius': 8
                }
            });
        });
    }, [clubs, onMarkerClick]);

    // Add click handler
    useEffect(() => {
        if (!map.current) return;

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