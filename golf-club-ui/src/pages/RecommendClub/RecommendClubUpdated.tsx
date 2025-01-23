import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Grid, CircularProgress,
  Alert, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';
import { config } from '../../config';

interface Course {
  id: string;
  name: string;
  distance_miles: number;
  price_tier: string;
  difficulty: string;
  score: number;
  // ... other course properties
}

const RecommendClubUpdated: React.FC = () => {
  const { session } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('25');

  const fetchRecommendations = async () => {
    try {
      if (!zipCode) {
        setError('Please enter a zip code');
        return;
      }

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

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchRecommendations();
    }
  }, [session]);

  if (isLoading) {
    return (
      <PageLayout title="Recommended Courses">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Recommended Courses">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
              onClick={() => {
                setIsLoading(true);
                fetchRecommendations();
              }}
              disabled={!zipCode || isLoading}
            >
              Find Recommendations
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{course.name}</Typography>
                <Typography color="textSecondary" gutterBottom>
                  Match Score: {course.score}%
                </Typography>
                <Typography variant="body2">
                  Distance: {course.distance_miles.toFixed(1)} miles
                </Typography>
                <Typography variant="body2">
                  Price Range: {course.price_tier}
                </Typography>
                <Typography variant="body2">
                  Difficulty: {course.difficulty}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {courses.length === 0 && !error && (
        <Alert severity="info">
          No recommendations found. Please update your profile preferences.
        </Alert>
      )}
    </PageLayout>
  );
};

export default RecommendClubUpdated;
