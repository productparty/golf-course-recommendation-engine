// components/ClubDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useMap } from '../hooks/useMap';
import { Club } from './ClubCard'; // Import the Club type

export const ClubDetailPage = () => {
    const { id } = useParams();
    const [club, setClub] = useState<Club | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const mapContainer = useRef<HTMLDivElement>(null);
    const { mapContainer: mapContainerHook } = useMap({ center: [club?.longitude || 0, club?.latitude || 0], radius: 500 });

    useEffect(() => {
        // Fetch club data from your backend
        fetch(`/api/clubs/${id}`)
            .then(res => res.json())
            .then(data => setClub(data));
    }, [id]);

    const toggleFavorite = () => {
        // Implement favorite toggle logic here
        setIsFavorite(!isFavorite);
    };

    return (
        <Box className="club-detail-container" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box ref={mapContainer as React.RefObject<HTMLDivElement>} sx={{ height: '300px', width: '100%' }} />
            <Box className="club-info" sx={{ p: 2 }}>
                <Typography variant="h4">{club?.club_name}</Typography>
                <Typography variant="body1">{club?.address}</Typography>
                <Typography variant="body2">{club?.city}, {club?.state} {club?.zip_code}</Typography>
                <IconButton onClick={toggleFavorite}>
                    {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="h6" sx={{ mt: 2 }}>Amenities & Facilities</Typography>
                <ul>
                    {club?.driving_range && <li>Driving Range</li>}
                    {club?.putting_green && <li>Putting Green</li>}
                    {club?.practice_bunker && <li>Practice Bunker</li>}
                    {club?.golf_lessons && <li>Golf Lessons</li>}
                    {club?.club_fitting && <li>Club Fitting</li>}
                    {club?.restaurant && <li>Restaurant</li>}
                </ul>
                <Typography variant="h6" sx={{ mt: 2 }}>Equipment & Services</Typography>
                <ul>
                    {club?.motor_cart && <li>Motor Cart</li>}
                    {club?.pull_cart && <li>Pull Cart</li>}
                    {club?.golf_clubs_rental && <li>Golf Clubs Rental</li>}
                </ul>
            </Box>
        </Box>
    );
};