import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Grid, CircularProgress,
  Alert, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';
import { config } from '../../config';
import ClubCard from '../../components/ClubCard';
import { supabase } from '../../lib/supabase';
import { InteractiveMap } from '../../components/InteractiveMap';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

interface Club {
  id: string;
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  distance_miles: number;
  price_tier: string;
  difficulty: string;
  score: number;
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

const isValidCoordinate = (lat: number, lng: number) => 
  !isNaN(lat) && !isNaN(lng) && 
  lat >= -90 && lat <= 90 && 
  lng >= -180 && lng <= 180;

const RecommendClubUpdated: React.FC = () => {
  const { session } = useAuth();
  const [courses, setCourses] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('25');
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-98.5795, 39.8283]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = async () => {
    if (!zipCode) {
      setError('Please enter a zip code');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const queryParams = new URLSearchParams({
        zip_code: zipCode,
        radius: radius,
        limit: '25'  // Maximum total results
      });

      const response = await fetch(
        `${config.API_URL}/api/get_recommendations/?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch recommendations');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!data.courses || !Array.isArray(data.courses)) {
        throw new Error('Invalid response format');
      }

      const coursesWithCoords = await Promise.all(data.courses.map(async (course: Club) => {
        try {
          const zipResponse = await fetch(`https://api.zippopotam.us/us/${course.zip_code}`);
          const zipData = await zipResponse.json();
          return {
            ...course,
            latitude: Number(zipData.places[0].latitude),
            longitude: Number(zipData.places[0].longitude)
          };
        } catch (error) {
          console.error('Failed to get coordinates:', error);
          return course; // Return without coords if lookup fails
        }
      }));

      setCourses(coursesWithCoords);
      setTotalPages(Math.ceil(coursesWithCoords.length / ITEMS_PER_PAGE));
      setCurrentPage(1);

      if (coursesWithCoords.length === 0) {
        setError('No recommendations found for this location');
      }
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      setError(error.message || 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPageCourses = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return courses.slice(start, start + ITEMS_PER_PAGE);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

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
        .insert([
          { 
            profile_id: session.user.id,
            golfclub_id: clubId
          }
        ]);
        
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '1rem'
      }}
    >
      <PageLayout 
        title="Recommended Clubs" 
        titleProps={{ 
          sx: { 
            textAlign: 'center', 
            color: 'primary.main',
            justifyContent: 'center'
          } 
        }}
      >
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ mb: 4, textAlign: 'center' }}
        >
          Enter your desired zip code and search radius below for club recommendations based on your profile.
        </Typography>
        <Card sx={{ 
          mb: 3, 
          mt: -2,
          mx: { xs: -2, sm: 0 }
        }}>
          <CardContent>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6}>
                <TextField
                fullWidth
                label="Zip Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                size="small"
                sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel>Search Radius</InputLabel>
                <Select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  label="Search Radius"
                >
                  <MenuItem value="10">10 miles</MenuItem>
                  <MenuItem value="25">25 miles</MenuItem>
                  <MenuItem value="50">50 miles</MenuItem>
                  <MenuItem value="100">100 miles</MenuItem>
                </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Finding Recommendations...
                  </>
                ) : (
                  'Find Recommendations'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {error && hasSearched && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {hasSearched && courses.length === 0 && !error && !isLoading && (
          <Alert severity="info">
            No recommendations found for this location.
          </Alert>
        )}

        {courses.length > 0 && (
          <>
            <Box sx={{ 
              height: '400px', 
              width: '100%',
              mb: 3, 
              borderRadius: 1 
            }}>
              <InteractiveMap
                clubs={getCurrentPageCourses().filter(c => 
                  c.latitude && c.longitude &&
                  isValidCoordinate(c.latitude, c.longitude)
                )}
                center={mapCenter}
                radius={parseInt(radius)}
                onMarkerClick={(clubId) => {
                  navigate(`/clubs/${clubId}`);
                }}
                showNumbers={true}
              />
            </Box>

            <Grid container spacing={2}>
              {courses
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((club, index) => (
                  <Grid item xs={12} key={club.id}>
                    <Box
                      sx={{
                        backgroundColor: club.score >= 80 ? 'rgba(46, 90, 39, 0.05)' : 'transparent',
                        borderRadius: 1,
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: club.score >= 80 ? 'rgba(46, 90, 39, 0.08)' : 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                    >
                      <Link 
                        to={`/clubs/${club.id}`} 
                        state={{ from: location.pathname + location.search }}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <ClubCard 
                          club={club}
                          showScore={true}
                          isFavorite={favorites.includes(club.id)}
                          onToggleFavorite={handleToggleFavorite}
                          showToggle={true}
                          index={index}
                          sx={{
                            '& .MuiCardHeader-action': {
                              position: { xs: 'static', sm: 'absolute' },
                              right: { xs: 0, sm: 16 },
                              top: { xs: 0, sm: 16 }
                            }
                          }}
                        />
                      </Link>
                    </Box>
                  </Grid>
                ))
              }
            </Grid>

            {/* Pagination Controls */}
            <Box sx={{ 
              mt: 3, 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center', 
              gap: { xs: 0.5, sm: 1 },
              '& .MuiButton-root': {
                minWidth: { xs: '40px', sm: 'auto' },
                px: { xs: 1, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
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
              
              {/* Page numbers */}
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
            <Typography 
              variant="body2" 
              sx={{ mt: 1, textAlign: 'center' }}
            >
              Page {currentPage} of {totalPages}
            </Typography>
          </>
        )}
      </PageLayout>
    </Box>
  );
};

export default RecommendClubUpdated;
