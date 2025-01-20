import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, SelectChangeEvent } from '@mui/material';
import './FindCourse.css';
import { config } from '../../config';

interface GolfCourse {
  club_name: string;
  course_name: string;
  city: string;
  state: string;
  distance_miles: number;
}

const technologyOptions = [
  'GPS',
  'Virtual Caddies',
  'Drone Rentals',
  'Mobile App Support',
  'Golf Simulators',
  'Drone Tracking',
  'Advanced GPS Mapping',
  'Live Leaderboards',
  'Smart Carts',
];

const FindCourse: React.FC = () => {
  const [zipCode, setZipCode] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [priceRange, setPriceRange] = useState<'' | '$' | '$$' | '$$$'>('');
  const [difficulty, setDifficulty] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
  const [findTechnologies, setFindTechnologies] = useState<string[]>([]);
  const [results, setResults] = useState<GolfCourse[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [courseError, setCourseError] = useState<string | null>(null);

  const fetchCourses = async (pageNumber: number) => {
    try {
      const params = {
        zip_code: zipCode,
        radius,
        limit: 10,
        offset: (pageNumber - 1) * 10,
        price_tier: priceRange || undefined,
        difficulty: difficulty || undefined,
        technologies: findTechnologies.length > 0 ? findTechnologies.join(',') : undefined
      };

      const response = await axios.get<{ results: GolfCourse[]; total: number }>(
        `${config.API_URL}/api/find_courses/`,
        { params }
      );

      setResults(response.data.results);
      setTotalPages(Math.ceil(response.data.total / 10));
      setCourseError(null);
    } catch (err) {
      setCourseError('Failed to fetch golf courses.');
      console.error('Error fetching courses:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchCourses(newPage);
  };

  const handleTechnologiesChange = (event: SelectChangeEvent<string[]>) => {
    const selectedOptions = event.target.value as string[];
    setFindTechnologies(selectedOptions);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Find Course
      </Typography>
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="ZIP Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          margin="normal"
        />
        {/* Add your other form elements here */}
        <Button onClick={() => fetchCourses(1)} variant="contained">
          Search
        </Button>
      </Box>
      {courseError && (
        <Typography color="error">{courseError}</Typography>
      )}
    </Container>
  );
};

export default FindCourse; 