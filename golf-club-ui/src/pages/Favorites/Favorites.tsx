import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import ClubCard from '../../components/ClubCard';
import PageLayout from '../../components/PageLayout';

interface GolfClub {
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
  club_membership: string;
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
  match_percentage: number;
}

interface FavoriteItem {
  id: string;
  golfclub_id: string;
  golfclub: GolfClub;
}

const Favorites: React.FC = () => {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
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
    
    // Transform the data to match FavoriteItem type
    const transformedData: FavoriteItem[] = data.map((item: any) => ({
      id: item.id,
      golfclub_id: item.golfclub_id,
      golfclub: {
        ...item.golfclub[0],
        distance_miles: item.golfclub[0]?.distance_miles || 0
      }
    }));
    
    setFavorites(transformedData);
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
                  club={{
                    ...favorite.golfclub,
                    score: undefined // Explicitly set score as undefined for favorites
                  }}
                  isFavorite={true}
                  showToggle={true}
                  onToggleFavorite={handleToggleFavorite}
                  showScore={false} // Don't show score in favorites
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