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
import { useFavorites } from '../../context/FavoritesContext';

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
  const { favoriteClubs, isLoading, error, toggleFavorite } = useFavorites();
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

  const handleToggleFavorite = async (clubId: string) => {
    await toggleFavorite(clubId);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(favoriteClubs.length / ITEMS_PER_PAGE));
  }, [favoriteClubs]);

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
