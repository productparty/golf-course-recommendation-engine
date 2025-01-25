import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Grid, CircularProgress,
  Alert, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';
import { config } from '../../config';
import ClubCard from '../../components/ClubCard';

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
}

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
  const ITEMS_PER_PAGE = 4;

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
      if (!data.courses || !Array.isArray(data.courses)) {
        throw new Error('Invalid response format');
      }

      setCourses(data.courses);
      setTotalPages(Math.ceil(data.courses.length / ITEMS_PER_PAGE));
      setCurrentPage(1);

      if (data.courses.length === 0) {
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

  return (
    <PageLayout title="Recommended Clubs">
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
          <Grid container spacing={2}>
            {getCurrentPageCourses().map((course) => (
              <Grid item xs={12} key={course.id}>
                <ClubCard club={course} showScore={true} />
              </Grid>
            ))}
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
  );
};

export default RecommendClubUpdated;
