// components/InteractiveMap.tsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box } from '@mui/material';
import { config } from '../config';

// Set the access token for mapboxgl
mapboxgl.accessToken = config.MAPBOX_TOKEN || '';

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
    onMarkerClick?: (clubId: string) => void;
    initialZoom?: number;
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

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  clubs, 
  center, 
  radius, 
  onMapClick, 
  onMarkerClick,
  initialZoom = 16 
}) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;
        if (!mapboxgl.accessToken) {
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
                map.current!.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    'tileSize': 512,
                    'maxzoom': 14
                });

                map.current!.setTerrain({ 
                    'source': 'mapbox-dem',
                    'exaggeration': 1.5 
                });

                map.current!.addLayer({
                    'id': 'sky',
                    'type': 'sky',
                    'paint': {
                        'sky-type': 'atmosphere',
                        'sky-atmosphere-sun': [0.0, 90.0],
                        'sky-atmosphere-sun-intensity': 15
                    }
                });

                // Add clubs source
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
                                name: club.club_name,
                                address: club.address
                            }
                        }))
                    },
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 50
                });

                // Add cluster layers
                map.current!.addLayer({
                    id: 'clusters',
                    type: 'circle',
                    source: 'clubs',
                    filter: ['has', 'point_count'],
                    paint: {
                        'circle-color': [
                            'step',
                            ['get', 'point_count'],
                            '#51bbd6',
                            10,
                            '#f1f075',
                            30,
                            '#f28cb1'
                        ],
                        'circle-radius': [
                            'step',
                            ['get', 'point_count'],
                            20,
                            10,
                            30,
                            30,
                            40
                        ]
                    }
                });

                // Add individual markers
                map.current!.addLayer({
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
                map.current!.addLayer({
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

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [clubs, center, radius, initialZoom]);

    return (
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
    );
};