import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Grid, CircularProgress,
  Alert, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';
import { config } from '../../config';
import ClubCard from '../../components/ClubCard';

interface Course {
  id: string;
  name: string;
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('25');
  const [hasSearched, setHasSearched] = useState(false);

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
        radius: radius
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

  return (
    <PageLayout title="Recommended Courses">
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zip Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
        <Grid container spacing={2}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} key={course.id}>
              <ClubCard club={course} showScore={true} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageLayout>
  );
};

export default RecommendClubUpdated;
