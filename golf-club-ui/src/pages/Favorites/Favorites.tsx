import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;  // Show 5 items per page

  const fetchFavorites = async () => {
    if (!session?.user?.id) return;
    
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        golfclub_id,
        golfclub:golfclubs(*)
      `)
      .eq('profile_id', session.user.id);
      
    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    const transformedData: FavoriteItem[] = data.map((item: any) => ({
      id: item.id,
      golfclub_id: item.golfclub_id,
      golfclub: item.golfclub[0] // Access first element since it returns an array
    }));
    
    setFavorites(transformedData);
    setTotalPages(Math.ceil(transformedData.length / ITEMS_PER_PAGE));
    setIsLoading(false);
  };

  const getCurrentPageFavorites = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return favorites.slice(start, start + ITEMS_PER_PAGE);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
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
          <>
            <Grid container spacing={2}>
              {getCurrentPageFavorites().map((favorite) => (
                <Grid item xs={12} key={favorite.id}>
                  <ClubCard
                    club={{
                      ...favorite.golfclub,
                      score: undefined
                    }}
                    isFavorite={true}
                    showToggle={true}
                    onToggleFavorite={handleToggleFavorite}
                    showScore={false}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Box sx={{ 
                mt: 3, 
                display: 'flex', 
                flexWrap: 'wrap',
                justifyContent: 'center', 
                gap: { xs: 0.5, sm: 1 }
              }}>
                <Button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  variant="outlined"
                >
                  First
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outlined"
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage - 2 + i;
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={pageNum === currentPage ? "contained" : "outlined"}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}
                
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outlined"
                >
                  Next
                </Button>
                <Button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  variant="outlined"
                >
                  Last
                </Button>
              </Box>
            )}
            
            {totalPages > 1 && (
              <Typography 
                variant="body2" 
                sx={{ mt: 1, textAlign: 'center' }}
              >
                Page {currentPage} of {totalPages}
              </Typography>
            )}
          </>
        )}
      </Box>
    </PageLayout>
  );
};

export default Favorites; 