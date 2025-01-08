import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, SelectChangeEvent } from '@mui/material';

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
      const response = await axios.get<{ results: GolfCourse[]; total: number }>(
        'http://127.0.0.1:8000/find_courses/',
        {
          params: {
            zip_code: zipCode,
            radius,
            price_tier: priceRange,
            difficulty,
            technologies: findTechnologies.join(','),  // pass selected tech
            limit: 10,
            offset: (pageNumber - 1) * 10,
          },
        }
      );
      setResults(response.data.results);
      setTotalPages(Math.ceil(response.data.total / 10));
      setCourseError(null);
    } catch (err) {
      setCourseError('Failed to fetch golf courses.');
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
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Find Course
      </Typography>
      <Typography variant="body1" gutterBottom>
        Search for golf courses in your area by filling out the form below with your preferences.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="ZIP Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter ZIP code"
          title="Enter the ZIP code of the area you want to search in"
          margin="normal"
          sx={{ backgroundColor: 'white' }}
        />
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel id="radius-label" shrink>Radius (miles)</InputLabel>
          <Select
            labelId="radius-label"
            label="Radius (miles)"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            title="Select the search radius in miles"
            sx={{ height: '56px' }} // Adjust height
          >
            {[1, 5, 10, 25, 50, 100].map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>Price Range</InputLabel>
          <Select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value as '' | '$' | '$$' | '$$$')}
            title="Select the preferred price range"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="$">$</MenuItem>
            <MenuItem value="$$">$$</MenuItem>
            <MenuItem value="$$$">$$$</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>Difficulty Level</InputLabel>
          <Select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as '' | 'Easy' | 'Medium' | 'Hard')}
            title="Select the difficulty level"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>Technologies</InputLabel>
          <Select
            multiple
            value={findTechnologies}
            onChange={handleTechnologiesChange}
            title="Select the preferred technologies"
          >
            {technologyOptions.map((tech) => (
              <MenuItem key={tech} value={tech}>
                {tech}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={() => fetchCourses(1)} variant="contained" color="primary" sx={{ mt: 2 }}>
          Find Courses
        </Button>
        {courseError && <Typography color="error" sx={{ mt: 2 }}>{courseError}</Typography>}
        {results.length > 0 && (
          <Box sx={{ maxHeight: '150px', overflowY: 'auto', mt: 2 }}>
            <ul className="results">
              {results.slice(0, 10).map((course, idx) => (
                <li key={idx}>
                  {course.club_name} - {course.course_name}, {course.city}, {course.state} (
                  {course.distance_miles.toFixed(2)} miles)
                </li>
              ))}
            </ul>
          </Box>
        )}
        {results.length > 0 && (
          <Box className="pagination" sx={{ mt: 2 }}>
            <Button onClick={() => handlePageChange(1)} disabled={page === 1}>
              First
            </Button>
            <Button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={page === pageNumber}
                >
                  {pageNumber}
                </Button>
              )
            )}
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
            <Button
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default FindCourse;
