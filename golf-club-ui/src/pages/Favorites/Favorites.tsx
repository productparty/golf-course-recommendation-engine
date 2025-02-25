import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import ClubCard from '../../components/ClubCard';
import PageLayout from '../../components/PageLayout';
import { InteractiveMap } from '../../components/InteractiveMap';
import { useNavigate, useLocation } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import type { FavoriteRecord, FavoriteClub, GolfClubResponse } from '../../types/golf-club';

interface GolfClubData {
  id: string;
  club_name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price_tier: string;
  difficulty: string;
  number_of_holes: string;
}

interface FavoriteResponse {
  golfclub_id: string;
  golfclub: GolfClubData;
}

const isValidCoordinate = (lat: number, lng: number): boolean =>
  !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

const isValidGolfClub = (club: unknown): club is GolfClubResponse => {
  if (!club || typeof club !== 'object') return false;
  const c = club as any;
  return (
    typeof c.id === 'string' &&
    typeof c.global_id === 'string' &&
    typeof c.club_name === 'string' &&
    typeof c.latitude === 'number' &&
    typeof c.longitude === 'number'
  );
};

const Favorites: React.FC = () => {
  const { session } = useAuth();
  const [favoriteClubs, setFavoriteClubs] = useState<FavoriteClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [mapCenter] = useState<[number, number]>([-98.5795, 39.8283]);
  const navigate = useNavigate();
  const mapRef = React.useRef<mapboxgl.Map | null>(null);

  const getCurrentPageFavorites = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return favoriteClubs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const fetchFavorites = async () => {
    if (!session?.user?.id) {
      setFavoriteClubs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // First, get all favorites for the user
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('golfclub_id')
        .eq('profile_id', session?.user?.id);

      if (favoritesError) throw favoritesError;

      if (!favoritesData || favoritesData.length === 0) {
        setFavoriteClubs([]);
        setIsLoading(false);
        return;
      }

      // Then, get the golf club details using the golfclub_ids
      const { data: golfclubData, error: golfclubError } = await supabase
        .from('golfclub')
        .select(`
          global_id,
          club_name,
          latitude,
          longitude,
          address,
          city,
          state,
          zip_code,
          price_tier,
          difficulty,
          number_of_holes,
          club_membership,
          driving_range,
          putting_green,
          chipping_green,
          practice_bunker,
          restaurant,
          lodging_on_site,
          motor_cart,
          pull_cart,
          golf_clubs_rental,
          club_fitting,
          golf_lessons
        `)
        .in('global_id', favoritesData.map(f => f.golfclub_id));

      if (golfclubError) throw golfclubError;

      if (!golfclubData) {
        setFavoriteClubs([]);
        setIsLoading(false);
        return;
      }

      // Map the golf club data to FavoriteClub type
      const validClubs = golfclubData.map(club => {
        const favoriteClub: FavoriteClub = {
          id: club.global_id, // Use global_id as id
          global_id: club.global_id,
          club_name: club.club_name,
          address: club.address,
          city: club.city,
          state: club.state,
          zip_code: club.zip_code,
          price_tier: club.price_tier,
          difficulty: club.difficulty,
          number_of_holes: club.number_of_holes,
          club_membership: club.club_membership,
          driving_range: Boolean(club.driving_range),
          putting_green: Boolean(club.putting_green),
          chipping_green: Boolean(club.chipping_green),
          practice_bunker: Boolean(club.practice_bunker),
          restaurant: Boolean(club.restaurant),
          lodging_on_site: Boolean(club.lodging_on_site),
          motor_cart: Boolean(club.motor_cart),
          pull_cart: Boolean(club.pull_cart),
          golf_clubs_rental: Boolean(club.golf_clubs_rental),
          club_fitting: Boolean(club.club_fitting),
          golf_lessons: Boolean(club.golf_lessons),
          latitude: club.latitude,
          longitude: club.longitude,
          golfclub_id: club.global_id,
          match_percentage: 0
        };
        return favoriteClub;
      });

      // Filter out any clubs with invalid coordinates
      const filteredClubs = validClubs.filter(club => 
        typeof club.latitude === 'number' && 
        typeof club.longitude === 'number' && 
        isValidCoordinate(club.latitude, club.longitude)
      );
      
      setFavoriteClubs(filteredClubs);
      setTotalPages(Math.ceil(filteredClubs.length / ITEMS_PER_PAGE));

    } catch (error) {
      console.error('Error fetching favorites:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to fetch favorites');
      } else {
        setError('Failed to fetch favorites');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (clubId: string) => {
    if (!session?.user?.id) return;

    await supabase
      .from('favorites')
      .delete()
      .eq('profile_id', session.user.id)
      .eq('golfclub_id', clubId);

    fetchFavorites();
  };

  const location = useLocation();
  
  useEffect(() => {
    if (session) {
      fetchFavorites();
    }
  }, [session, location.pathname]);

  useEffect(() => {
    if (favoriteClubs.length > 0) {
      const newBounds = new mapboxgl.LngLatBounds();
      favoriteClubs.forEach((club) => {
        if (club.longitude && club.latitude) {
          newBounds.extend([club.longitude, club.latitude]);
        }
      });
      mapRef.current?.fitBounds(newBounds, { padding: 50 });
    }
  }, [favoriteClubs]);

  return (
    <PageLayout title="Favorite Clubs">
      <Box sx={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : favoriteClubs.length > 0 ? (
          <>
            <Box sx={{ mb: 4 }}>
              <InteractiveMap
                clubs={favoriteClubs.filter((c) => c.latitude && c.longitude && isValidCoordinate(c.latitude, c.longitude)).map(club => ({
                  ...club,
                  id: club.golfclub_id
                }))}
                center={mapCenter}
                radius={25}
                onMarkerClick={(clubId) => navigate(`/clubs/${clubId}`)}
                showNumbers={false}
                key="favorites-map"
              />
            </Box>

            <Grid container spacing={2}>
              {getCurrentPageFavorites().map((club, index) => (
                <Grid item xs={12} key={club.golfclub_id}>
                  <Box
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: 1,
                      boxShadow: 1,
                      padding: 2,
                      position: 'relative',
                    }}
                  >
                    <ClubCard
                      club={club}
                      isFavorite={true}
                      onToggleFavorite={() => handleToggleFavorite(club.golfclub_id)}
                      showToggle={true}
                      index={(currentPage - 1) * ITEMS_PER_PAGE + index}
                      showScore={false}
                      onClick={() => navigate(`/clubs/${club.golfclub_id}`)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Button onClick={() => handlePageChange(1)} disabled={currentPage === 1} variant="outlined">
                    First
                  </Button>
                  <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outlined">
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage - 2 + i;
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={pageNum === currentPage ? 'contained' : 'outlined'}
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
                  <Button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} variant="outlined">
                    Last
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Page {currentPage} of {totalPages}
                </Typography>
              </>
            )}
          </>
        ) : (
          <Alert severity="info">You haven't added any clubs to your favorites yet.</Alert>
        )}
      </Box>
    </PageLayout>
  );
};

export default Favorites;
