import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, SelectChangeEvent } from '@mui/material';
import './FindClub.css';

interface GolfClub {
  club_name: string;
  city: string;
  state: string;
  distance_miles: number;
  price_tier?: string;
  difficulty?: string;
  technologies?: string[];
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

const FindClub: React.FC = () => {
  const [zipCode, setZipCode] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [priceRange, setPriceRange] = useState<'' | '$' | '$$' | '$$$'>('');
  const [difficulty, setDifficulty] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
  const [findTechnologies, setFindTechnologies] = useState<string[]>([]);
  const [results, setResults] = useState<GolfClub[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [clubError, setClubError] = useState<string | null>(null);

  const fetchClubs = async (pageNumber: number) => {
    try {
      const params: any = {
        zip_code: zipCode,
        radius,
        limit: 5,  // Limit the number of results to 5
        offset: (pageNumber - 1) * 5,
      };

      if (priceRange) params.price_tier = priceRange;
      if (difficulty) params.difficulty = difficulty;
      if (findTechnologies.length > 0) params.technologies = findTechnologies.join(',');

      const response = await axios.get<{ results: GolfClub[]; total: number }>(
        `${process.env.REACT_APP_API_URL}/find_clubs/`,
        { params }
      );

      setResults(response.data.results);
      setTotalPages(Math.ceil(response.data.total / 5));
      setClubError(null);
    } catch (err) {
      setClubError('Failed to fetch golf clubs.');
      console.error('Error fetching clubs:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchClubs(newPage);
  };

  const handleTechnologiesChange = (event: SelectChangeEvent<string[]>) => {
    const selectedOptions = event.target.value as string[];
    setFindTechnologies(selectedOptions);
  };

  return (
    <div className="find-club-container">
      {/* Top Image Section */}
      <div className="top-image">
        <img
          src="/golfclubheader.jpg" // Replace with your image path
          alt="Promotional banner"
          className="header-image"
        />
      </div>

      {/* Content Section */}
      <div className="content">
        {/* Filters Section */}
        <aside className="filters">
          <Typography variant="h4" component="h1" gutterBottom>
            Find Club
          </Typography>
          <Typography variant="body1" gutterBottom>
            Search for golf clubs in your area by filling out the form below with your preferences.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <div className="form-group">
              <div className="input-group" style={{ width: '100%' }}>
                <TextField
                  fullWidth
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter ZIP code"
                  title="Enter the ZIP code of the area you want to search in"
                  margin="normal"
                  sx={{ backgroundColor: 'white', border: 'none', width: '100%' }} // Ensure full width
                  inputProps={{ maxLength: 5 }} // Ensure ZIP code is limited to 5 characters
                />
                <span className="input-group-text">
                  <i className="fas fa-ellipsis-h"></i> {/* Adjust this to your icon */}
                </span>
              </div>
            </div>
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
            <Button onClick={() => fetchClubs(1)} variant="contained" color="primary" sx={{ mt: 2 }}>
              Find Clubs
            </Button>
            {clubError && <Typography color="error" sx={{ mt: 2 }}>{clubError}</Typography>}
          </Box>
        </aside>

        {/* Results Section */}
        <section className="results">
          <Typography variant="h5" component="h2" gutterBottom>
            Search Results
          </Typography>
          {results.length > 0 ? (
            <Box sx={{ maxHeight: '600px', overflowY: 'auto', mt: 2 }}>
              <ol className="results">
                {results.map((club, idx) => (
                  <li key={idx} className="result-item">
                    <div className="result-left">
                      <Typography variant="h6">{club.club_name}</Typography>
                      <Typography variant="body2">{club.city}, {club.state} ({club.distance_miles.toFixed(2)} miles)</Typography>
                    </div>
                    <div className="result-right">
                      {club.price_tier && <Typography variant="body2">Price Range: {club.price_tier}</Typography>}
                      {club.difficulty && <Typography variant="body2">Difficulty Level: {club.difficulty}</Typography>}
                      {club.technologies && club.technologies.length > 0 && (
                        <Typography variant="body2">Technologies: {club.technologies.join(', ')}</Typography>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
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
            </Box>
          ) : (
            <Typography variant="body1">No results found.</Typography>
          )}
        </section>
      </div>
    </div>
  );
};

export default FindClub;
