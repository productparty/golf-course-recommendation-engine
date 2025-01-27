// components/ClubDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMap } from '../hooks/useMap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Club {
    id: string;
    club_name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    distance_miles?: number;
    price_tier: string;
    difficulty: string;
    number_of_holes: string;
    membership_type?: string; // Changed from club_membership to match database
    driving_range: boolean;
    putting_green: boolean;
    chipping_green: boolean;
    practice_bunker: boolean;
    restaurant: boolean;
    lodging_on_site: boolean;
    motor_cart: boolean;
    pull_cart: boolean;
    golf_clubs_rental: boolean;
    club_fitting: boolean;
    golf_lessons: boolean;
    latitude?: number;
    longitude?: number;
    match_percentage?: number;
}

export const ClubDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session } = useAuth();
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);

    const isFavorite = favorites.includes(id || '');

    const fetchFavorites = async () => {
        if (!session?.user?.id) return;
        
        const { data, error } = await supabase
            .from('favorites')
            .select('golfclub_id')
            .eq('profile_id', session.user.id);
            
        if (error) {
            console.error('Error fetching favorites:', error);
            return;
        }
        
        setFavorites(data.map(fav => fav.golfclub_id));
    };

    const handleToggleFavorite = async (clubId: string) => {
        if (!session?.user?.id) return;

        const isFavorite = favorites.includes(clubId);
        
        if (isFavorite) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('profile_id', session.user.id)
                .eq('golfclub_id', clubId);
                
            if (error) {
                console.error('Error removing favorite:', error);
                return;
            }
            
            setFavorites(prev => prev.filter(id => id !== clubId));
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert([{ 
                    profile_id: session.user.id,
                    golfclub_id: clubId
                }]);
                
            if (error) {
                console.error('Error adding favorite:', error);
                return;
            }
            
            setFavorites(prev => [...prev, clubId]);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [session?.user?.id]);

    const { mapContainer, setMapContainer } = useMap({
        center: club ? [club.longitude || 0, club.latitude || 0] : [0, 0],
        radius: 500
    });

    useEffect(() => {
        const fetchClub = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('golfclub')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Club not found');
                
                setClub(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClub();
    }, [id]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!club) return <Typography>Club not found</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">{club.club_name}</Typography>
                {session && (
                    <IconButton 
                        onClick={() => handleToggleFavorite(club.id)} 
                        size="large"
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                )}
            </Box>

            <Box ref={setMapContainer} sx={{ height: '400px', mb: 3, borderRadius: 1 }} />

            <Box sx={{ display: 'grid', gap: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>Location</Typography>
                    <Typography>{club.address}</Typography>
                    <Typography>{club.city}, {club.state} {club.zip_code}</Typography>
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom>Details</Typography>
                    <Typography>Price Tier: {club.price_tier}</Typography>
                    <Typography>Difficulty: {club.difficulty}</Typography>
                    <Typography>Number of Holes: {club.number_of_holes}</Typography>
                    {club.membership_type && (
                        <Typography>Membership: {club.membership_type}</Typography>
                    )}
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom>Amenities & Facilities</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                        {club.driving_range && <Typography>• Driving Range</Typography>}
                        {club.putting_green && <Typography>• Putting Green</Typography>}
                        {club.practice_bunker && <Typography>• Practice Bunker</Typography>}
                        {club.restaurant && <Typography>• Restaurant</Typography>}
                        {club.lodging_on_site && <Typography>• Lodging Available</Typography>}
                    </Box>
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom>Equipment & Services</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                        {club.motor_cart && <Typography>• Motor Cart</Typography>}
                        {club.pull_cart && <Typography>• Pull Cart</Typography>}
                        {club.golf_clubs_rental && <Typography>• Club Rental</Typography>}
                        {club.club_fitting && <Typography>• Club Fitting</Typography>}
                        {club.golf_lessons && <Typography>• Golf Lessons</Typography>}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};