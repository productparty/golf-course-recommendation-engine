// components/InteractiveMap.tsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Map, Marker, Popup, LngLatBounds, LngLat } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box } from '@mui/material';
import { config } from '../config';

// Add type assertion for mapboxgl access
(mapboxgl as any).accessToken = config.MAPBOX_TOKEN;

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

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  clubs,
  center,
  radius,
  onMapClick,
  onMarkerClick,
  showNumbers = false,
  initialZoom = 14
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<Map | null>(null);
    const markers = useRef<mapboxgl.Marker[]>([]);
    const bounds = useRef<mapboxgl.LngLatBounds | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        if (!mapContainer.current) return;
        if (!(mapboxgl as any).accessToken) {
            console.error('Mapbox token is not set');
            return;
        }

        // Filter out clubs without valid coordinates
        const validClubs = clubs.filter(club => 
            club.latitude != null && 
            club.longitude != null && 
            !isNaN(club.latitude) && 
            !isNaN(club.longitude)
        );

        if (validClubs.length === 0) {
            console.warn('No valid club coordinates found');
        }

        // Initialize map if it doesn't exist
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/outdoors-v12', // Terrain-friendly style
                center: center,
                zoom: initialZoom,
                pitch: 45,
                bearing: 0,
            });

            // Add terrain and sky layers
            map.current.on('load', () => {
                if (map.current) {
                    map.current.addSource('mapbox-dem', {
                        'type': 'raster-dem',
                        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                        'tileSize': 512,
                        'maxzoom': 14
                    });

                    map.current.setTerrain({ 
                        'source': 'mapbox-dem',
                        'exaggeration': 1.5 
                    });

                    map.current.addLayer({
                        'id': 'sky',
                        'type': 'sky',
                        'paint': {
                            'sky-type': 'atmosphere',
                            'sky-atmosphere-sun': [0.0, 90.0],
                            'sky-atmosphere-sun-intensity': 15
                        }
                    });

                    // Add clubs source
                    map.current.addSource('clubs', {
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
                                    name: club.club_name,
                                    address: club.address
                                }
                            }))
                        },
                        cluster: false
                    });

                    // Add individual markers
                    map.current.addLayer({
                        id: 'unclustered-point',
                        type: 'circle',
                        source: 'clubs',
                        filter: ['!', ['has', 'point_count']],
                        paint: {
                            'circle-color': '#11b4da',
                            'circle-radius': 8,
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#fff'
                        }
                    });

                    // Add club labels
                    map.current.addLayer({
                        id: 'club-labels',
                        type: 'symbol',
                        source: 'clubs',
                        filter: ['!', ['has', 'point_count']],
                        layout: {
                            'text-field': ['get', 'name'],
                            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                            'text-size': 12,
                            'text-offset': [0, 1.5],
                            'text-anchor': 'top'
                        },
                        paint: {
                            'text-halo-color': '#fff',
                            'text-halo-width': 1
                        }
                    });
                }
            });
        }

        // Update map center and source data when props change
        if (map.current) {
            map.current.setCenter(center);
            const source = map.current.getSource('clubs') as mapboxgl.GeoJSONSource;
            if (source) {
                source.setData({
                    type: 'FeatureCollection',
                    features: validClubs.map(club => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [club.longitude!, club.latitude!]
                        },
                        properties: {
                            id: club.id,
                            name: club.club_name,
                            address: club.address
                        }
                    }))
                });
            }
        }

        // Clear existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Add new markers
        clubs.forEach((club, index) => {
            if (club.latitude && club.longitude && 
                isValidCoordinate(club.latitude, club.longitude)) {
                const el = showNumbers ? createNumberedMarker(index + 1) : document.createElement('div');
                if (!showNumbers) {
                    el.className = 'marker';
                }
                
                const marker = new mapboxgl.Marker(el)
                    .setLngLat(new (mapboxgl as any).LngLat(club.longitude, club.latitude))
                    .setPopup(new mapboxgl.Popup().setHTML(club.club_name))
                    .addTo(map.current!);

                markers.current.push(marker);

                el.addEventListener('click', () => onMarkerClick(club.id));
            }
        });

        // Only fit bounds if clubs change
        if (clubs.length > 0 && clubs.some(club => club.longitude && club.latitude)) {
            const newBounds = new mapboxgl.LngLatBounds();
            clubs.forEach(club => {
                if (club.longitude && club.latitude) {
                    newBounds.extend([club.longitude, club.latitude]);
                }
            });
            
            // Only update bounds if they've changed significantly
            if (!bounds.current || !bounds.current.toArray().every((coord, i) => 
                Math.abs(Number(coord) - Number(newBounds.toArray()[i])) > 0.0001
            )) {
                map.current!.fitBounds(newBounds, { padding: 50 });
                bounds.current = newBounds;
            }
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [containerRef.current]);

    return (
        <Box ref={containerRef} sx={{ height: '100%', width: '100%' }}>
            <Box
                ref={mapContainer}
                sx={{
                    height: '400px',
                    width: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    '& .mapboxgl-canvas': {
                        borderRadius: 1
                    }
                }}
            />
        </Box>
    );
};
