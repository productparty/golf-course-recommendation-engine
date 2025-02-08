import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { config } from '../../config';
import ClubCard from '../../components/ClubCard';
import PageLayout from '../../components/PageLayout';
import { InteractiveMap } from '../../components/InteractiveMap';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';

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

interface FavoriteClub extends GolfClub {
  golfclub_id: string;
}

const isValidCoordinate = (lat: number, lng: number): boolean =>
  !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

const Favorites: React.FC = () => {
  const { session } = useAuth();
  const [favoriteClubs, setFavoriteClubs] = useState<FavoriteClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [mapCenter, setMapCenter] = useState<[number, number]>([-98.5795, 39.8283]);
  const navigate = useNavigate();
  const mapRef = React.useRef<mapboxgl.Map | null>(null);

  const fetchFavorites = async () => {
    if (!session?.user?.id) {
      setFavoriteClubs([]);
      setTotalPages(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('golfclub_id')
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
        setError('Failed to fetch favorites. Please try again later.');
        setIsLoading(false);
        return;
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavoriteClubs([]);
        setTotalPages(0);
        setIsLoading(false);
        return;
      }

      const clubIds = favoritesData.map((f) => f.golfclub_id).join(',');
      const response = await fetch(`${config.API_URL}/api/clubs/?ids=${clubIds}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || `Failed to fetch club details: ${response.status}`);
        setIsLoading(false);
        return;
      }

      const clubsData = await response.json();

      if (clubsData && clubsData.results) {
        const clubsWithCoords = await Promise.all(
          clubsData.results.map(async (club: GolfClub) => {
            try {
              const response = await fetch(`https://api.zippopotam.us/us/${club.zip_code}`);
              if (!response.ok) {
                throw new Error(`Failed to get coordinates for ${club.zip_code}`);
              }
              const zipData = await response.json();
              return {
                ...club,
                latitude: Number(zipData.places[0].latitude),
                longitude: Number(zipData.places[0].longitude),
                golfclub_id: club.id,
              };
            } catch (error: unknown) {
              console.error(`Failed to get coordinates for ${club.zip_code}:`, error);
              return { ...club, golfclub_id: club.id };
            }
          })
        );

        const validClubs = clubsWithCoords.filter((club) =>
          club.latitude && club.longitude && isValidCoordinate(club.latitude, club.longitude)
        );

        setFavoriteClubs(validClubs);
        setTotalPages(Math.ceil(validClubs.length / ITEMS_PER_PAGE));

        if (validClubs.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          validClubs.forEach((club) => {
            if (club.longitude && club.latitude) {
              bounds.extend([club.longitude, club.latitude]);
            }
          });
          mapRef.current?.fitBounds(bounds, { padding: 50, maxZoom: 12 });
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching favorites:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const getCurrentPageFavorites = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return favoriteClubs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
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

    fetchFavorites();
  };

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
                clubs={favoriteClubs.filter((c) => c.latitude && c.longitude && isValidCoordinate(c.latitude, c.longitude))}
                center={mapCenter}
                radius={25}
                onMarkerClick={(clubId) => navigate(`/clubs/${clubId}`)}
                showNumbers={false}
                key="favorites-map"
              />
            </Box>

            <Grid container spacing={2}>
              {getCurrentPageFavorites().map((club, index) => (
                <Grid item xs={12} key={club.id}>
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
                      onToggleFavorite={() => handleToggleFavorite(club.id)}
                      showToggle={true}
                      index={(currentPage - 1) * ITEMS_PER_PAGE + index}
                      showScore={false}
                      onClick={() => navigate(`/clubs/${club.id}`)}
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
