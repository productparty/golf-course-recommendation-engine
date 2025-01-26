import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Paper, Grid, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { InteractiveMap } from '../../components/InteractiveMap';
import PageLayout from '../../components/PageLayout';
import { Club } from 'types/Club';
import { config } from '../../config';
import { useAuth } from '../../context/AuthContext';

type ClubDetail = Club;

export const ClubDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [club, setClub] = useState<ClubDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();

    useEffect(() => {
        const fetchClubDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                // Parse the slug to get state, zip, and name
                const [state, zip, ...nameParts] = slug?.split('_') || [];
                const clubName = nameParts.join('_').replace(/-/g, ' ');

                if (!state || !zip || !clubName) {
                    throw new Error('Invalid URL format');
                }

                const response = await fetch(
                    `${config.API_URL}/api/clubs/details/?state=${state}&zip=${zip}&name=${encodeURIComponent(clubName)}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session?.access_token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch club details');
                }

                const data = await response.json();
                setClub(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching club details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchClubDetails();
        }
    }, [slug, session]);

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
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
                        Back to Search
                    </Button>
                    <Alert severity="error" sx={{ mt: 2 }}>
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

                <Box sx={{ mb: 4 }}>
                    <InteractiveMap 
                        clubs={[club]}
                        center={[club.longitude || 0, club.latitude || 0]}
                        radius={0}
                    />
                </Box>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Club Details</Typography>
                    <Typography><strong>Address:</strong> {club.address}</Typography>
                    <Typography><strong>City:</strong> {club.city}</Typography>
                    <Typography><strong>State:</strong> {club.state}</Typography>
                    <Typography><strong>Zip Code:</strong> {club.zip_code}</Typography>
                    <Typography><strong>Price Tier:</strong> {club.price_tier}</Typography>
                    <Typography><strong>Difficulty:</strong> {club.difficulty}</Typography>
                    <Typography><strong>Number of Holes:</strong> {club.number_of_holes}</Typography>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Amenities</Typography>
                    <Grid container spacing={2}>
                        {[
                            { label: 'Driving Range', value: club.driving_range },
                            { label: 'Putting Green', value: club.putting_green },
                            { label: 'Chipping Green', value: club.chipping_green },
                            { label: 'Practice Bunker', value: club.practice_bunker },
                            { label: 'Restaurant', value: club.restaurant },
                            { label: 'Lodging', value: club.lodging_on_site },
                            { label: 'Motor Cart', value: club.motor_cart },
                            { label: 'Pull Cart', value: club.pull_cart },
                            { label: 'Club Rental', value: club.golf_clubs_rental },
                            { label: 'Club Fitting', value: club.club_fitting },
                            { label: 'Golf Lessons', value: club.golf_lessons },
                        ].map(({ label, value }) => (
                            <Grid item xs={6} sm={4} key={label}>
                                <Box display="flex" alignItems="center">
                                    {value ? 
                                        <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : 
                                        <CancelIcon color="error" sx={{ mr: 1 }} />
                                    }
                                    <Typography>{label}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Box>
        </PageLayout>
    );
};

export default ClubDetail; 