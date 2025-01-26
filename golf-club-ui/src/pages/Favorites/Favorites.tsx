import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import ClubCard from '../../components/ClubCard';
import PageLayout from '../../components/PageLayout';

const Favorites: React.FC = () => {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!session?.user?.id) return;
    
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        golfclub_id,
        golfclub:golfclub(*)
      `)
      .eq('profile_id', session.user.id);
      
    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }
    
    setFavorites(data);
    setIsLoading(false);
  };

  const handleToggleFavorite = async (clubId: string) => {
    if (!session?.user?.id) return;
    
    await supabase
      .from('favorites')
      .delete()
      .eq('profile_id', session.user.id)
      .eq('golfclub_id', clubId);
      
    // Refresh favorites after removing
    fetchFavorites();
  };

  useEffect(() => {
    fetchFavorites();
  }, [session?.user?.id]);

  return (
    <PageLayout title="My Favorite Clubs">
      <Box sx={{ p: 3 }}>
        {isLoading ? (
          <Typography>Loading favorites...</Typography>
        ) : favorites.length === 0 ? (
          <Typography>No favorites saved yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {favorites.map((favorite) => (
              <Grid item xs={12} key={favorite.id}>
                <ClubCard
                  club={favorite.golfclub}
                  isFavorite={true}
                  showToggle={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </PageLayout>
  );
};

export default Favorites; 