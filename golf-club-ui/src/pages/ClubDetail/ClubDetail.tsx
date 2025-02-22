import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageLayout from '../../components/PageLayout';
import { InteractiveMap } from '../../components/InteractiveMap';
import { config } from '../../config';
import { useAuth } from '../../context/AuthContext';
import type { Club } from '../../types/Club';

export const ClubDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session } = useAuth();
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClubDetails = async () => {
            if (!id || !session?.access_token) return;
            
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${config.API_URL}/api/clubs/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch club details');
                }

                const data = await response.json();
                setClub(data);
            } catch (err) {
                console.error('Error fetching club details:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchClubDetails();
    }, [id, session]);

    if (loading) {
        return (
            <PageLayout title="Loading...">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    if (error || !club) {
        return (
            <PageLayout title="Error">
                <Box sx={{ p: 3 }}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={() => navigate(-1)}
                        sx={{ mb: 3 }}
                    >
                        Back to Search
                    </Button>
                    <Alert severity="error">
                        {error || 'Failed to load club details'}
                    </Alert>
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout title={club.club_name}>
            <Box sx={{ p: 3 }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate(-1)}
                    sx={{ mb: 3 }}
                >
                    Back to Search
                </Button>

                <Typography variant="h4" gutterBottom>{club.club_name}</Typography>

                <Box sx={{ mb: 4, height: '400px' }}>
                    <InteractiveMap 
                        clubs={[club]}
                        center={[
                            club.longitude || -98.5795, // Default to US center if no coords
                            club.latitude || 39.8283
                        ]}
                        radius={0}
                        onMarkerClick={(clubId) => {
                            console.log(`Marker clicked for club ID: ${clubId}`);
                        }}
                    />
                </Box>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Club Details</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Typography><strong>Address:</strong> {club.address}</Typography>
                        <Typography><strong>City:</strong> {club.city}</Typography>
                        <Typography><strong>State:</strong> {club.state}</Typography>
                        <Typography><strong>Zip Code:</strong> {club.zip_code}</Typography>
                        <Typography><strong>Price Tier:</strong> {club.price_tier}</Typography>
                        <Typography><strong>Difficulty:</strong> {club.difficulty}</Typography>
                        <Typography><strong>Number of Holes:</strong> {club.number_of_holes}</Typography>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Amenities</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {club.driving_range && <Typography>✓ Driving Range</Typography>}
                        {club.putting_green && <Typography>✓ Putting Green</Typography>}
                        {club.chipping_green && <Typography>✓ Chipping Green</Typography>}
                        {club.practice_bunker && <Typography>✓ Practice Bunker</Typography>}
                        {club.restaurant && <Typography>✓ Restaurant</Typography>}
                        {club.lodging_on_site && <Typography>✓ Lodging On-Site</Typography>}
                        {club.motor_cart && <Typography>✓ Motor Cart</Typography>}
                        {club.pull_cart && <Typography>✓ Pull Cart</Typography>}
                        {club.golf_clubs_rental && <Typography>✓ Club Rental</Typography>}
                        {club.club_fitting && <Typography>✓ Club Fitting</Typography>}
                        {club.golf_lessons && <Typography>✓ Golf Lessons</Typography>}
                    </Box>
                </Paper>
            </Box>
        </PageLayout>
    );
};

export default ClubDetail;
