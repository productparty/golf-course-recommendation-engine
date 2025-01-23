import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Grid, CircularProgress,
  Alert, Box
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

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/recommend-courses`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setCourses(data.courses);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };

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
