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

const RecommendCourse: React.FC = () => {
  const [zipCode, setZipCode] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [preferredPriceRange, setPreferredPriceRange] = useState<'' | '$' | '$$' | '$$$'>('');
  const [recommendTechnologies, setRecommendTechnologies] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<GolfCourse[]>([]);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get<{ results: GolfCourse[] }>(
        'http://127.0.0.1:8000/get_recommendations/',
        {
          params: {
            zip_code: zipCode,
            radius,
            skill_level: skillLevel,
            preferred_price_range: preferredPriceRange,
            technologies: recommendTechnologies.join(','),
          },
        }
      );
      setRecommendations(response.data.results);
      setRecommendationError(null);
    } catch (err) {
      setRecommendationError('Failed to fetch recommendations.');
    }
  };

  const handleTechnologiesChange = (event: SelectChangeEvent<typeof recommendTechnologies>) => {
    const {
      target: { value },
    } = event;
    setRecommendTechnologies(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Recommend Course
      </Typography>
      <Typography variant="body1" gutterBottom>
        Use the form below to get personalized golf course recommendations.
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
          sx={{ height: '56px' }}
        >
          {[1, 5, 10, 25, 50, 100].map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
        <InputLabel id="skill-level-label" >Skill Level</InputLabel>
        <Select
          labelId="skill-level-label"
          label="Skill Level"
          value={skillLevel}
          onChange={(e) => setSkillLevel(e.target.value)}
          title="Select your skill level"
          sx={{ height: '56px' }}
        >
          {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => (
            <MenuItem key={level} value={level}>
              {level}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
        <InputLabel id="price-range-label" >Preferred Price Range</InputLabel>
        <Select
          labelId="price-range-label"
          label="Preferred Price Range"
          value={preferredPriceRange}
          onChange={(e) => setPreferredPriceRange(e.target.value as '' | '$' | '$$' | '$$$')}
          title="Select the preferred price range"
          sx={{ height: '56px' }}
        >
          {['$', '$$', '$$$'].map((price) => (
            <MenuItem key={price} value={price}>
              {price}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
        <InputLabel id="technologies-label" >Preferred Technologies</InputLabel>
        <Select
          labelId="technologies-label"
          label="Preferred Technologies"
          multiple
          value={recommendTechnologies}
          onChange={handleTechnologiesChange}
          title="Select the preferred technologies"
          sx={{ height: '56px' }}
        >
          {technologyOptions.map((tech) => (
            <MenuItem key={tech} value={tech}>
              {tech}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
        <Button onClick={fetchRecommendations} variant="contained" color="primary" sx={{ mt: 2 }}>
          Get Recommendations
        </Button>
        {recommendationError && <Typography color="error" sx={{ mt: 2 }}>{recommendationError}</Typography>}
        {recommendations.length > 0 && (
          <Box sx={{ maxHeight: '150px', overflowY: 'auto', mt: 2 }}>
            <ul className="results">
              {recommendations.map((rec, idx) => (
                <li key={idx}>
                  {rec.club_name} - {rec.course_name}, {rec.city}, {rec.state} ({rec.distance_miles.toFixed(2)} miles)
                </li>
              ))}
            </ul>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default RecommendCourse;
