import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, SelectChangeEvent } from '@mui/material';
import './FindClub.css';
import { config } from '../../config';
import PageLayout from '../../components/PageLayout';

interface GolfClub {
  global_id: string;
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  distance_miles: number;
  price_tier?: string;
  difficulty?: string;
  available_technologies?: string[];
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
  const [priceTier, setPriceTier] = useState<'' | '$' | '$$' | '$$$'>('');
  const [difficulty, setDifficulty] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
  const [findTechnologies, setFindTechnologies] = useState<string[]>([]);
  const [results, setResults] = useState<GolfClub[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clubError, setClubError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      const url = new URL(`${config.API_URL}/api/find_clubs/`);
      url.searchParams.append('zip_code', zipCode);
      url.searchParams.append('radius', radius.toString());
      url.searchParams.append('limit', '5');
      url.searchParams.append('offset', '0');

      console.log('Making request to:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Origin': import.meta.env.VITE_APP_URL
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results);
      setTotalPages(Math.max(1, data.total_pages || 1));
      setCurrentPage(data.page || 1);
    } catch (error) {
      console.error('Error in fetchClubs:', error);
      setClubError(error instanceof Error ? error.message : 'Failed to fetch clubs');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    fetchClubs();
  };

  const handleTechnologiesChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    // On autofill we get a stringified value.
    const selectedTechs = typeof value === 'string' ? value.split(',') : value;
    setFindTechnologies(selectedTechs);
  };

  const handlePriceTierChange = (event: SelectChangeEvent<string>) => {
    setPriceTier(event.target.value as '' | '$' | '$$' | '$$$');
  };

  const handleDifficultyChange = (event: SelectChangeEvent<string>) => {
    setDifficulty(event.target.value as '' | 'Easy' | 'Medium' | 'Hard');
  };

  const handleSearch = async () => {
    await fetchClubs();
  };

  useEffect(() => {
    // Placeholder for any additional effects
  }, []);

  return (
    <PageLayout title="Find Golf Clubs">
      <div className="content">
        <aside className="filters">
          <Typography variant="body1" gutterBottom>
            Find golf clubs near you
          </Typography>
          <Box sx={{ 
            mt: 2,
            width: '100%',
            '& .MuiTextField-root': { width: '100%' },
            '& .MuiFormControl-root': { width: '100%' }
          }}>
            <TextField
              label="ZIP Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              margin="normal"
              inputProps={{ maxLength: 5 }}
              sx={{ 
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                },
              }}
            />
            <FormControl margin="normal">
              <InputLabel>Radius (miles)</InputLabel>
              <Select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                sx={{ backgroundColor: 'white' }}
              >
                {[1, 5, 10, 25, 50, 100].map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl margin="normal">
              <InputLabel>Price Range</InputLabel>
              <Select
                value={priceTier}
                onChange={handlePriceTierChange}
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="$">$</MenuItem>
                <MenuItem value="$$">$$</MenuItem>
                <MenuItem value="$$$">$$$</MenuItem>
              </Select>
            </FormControl>

            <FormControl margin="normal">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficulty}
                onChange={handleDifficultyChange}
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </Select>
            </FormControl>

            <FormControl margin="normal">
              <InputLabel>Technologies</InputLabel>
              <Select
                multiple
                value={findTechnologies}
                onChange={handleTechnologiesChange}
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value="TrackMan">TrackMan</MenuItem>
                <MenuItem value="TopTracer">TopTracer</MenuItem>
                <MenuItem value="FlightScope">FlightScope</MenuItem>
                <MenuItem value="GCQuad">GCQuad</MenuItem>
              </Select>
            </FormControl>

            <Button 
              onClick={handleSearch}
              variant="contained"
              color="primary"
              sx={{ mt: 2, width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Find Clubs'}
            </Button>
          </Box>
          {clubError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {clubError}
            </Typography>
          )}
        </aside>

        <section className="results">
          <Typography variant="h5" gutterBottom>
            Search Results
          </Typography>
          {results.length > 0 ? (
            <>
              {results.map((club) => (
                <Box 
                  key={club.global_id} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Left side - Club name and address */}
                  <Box sx={{ flex: '1' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold',
                        mb: 0.5
                      }}
                    >
                      {club.club_name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {club.address}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {club.city}, {club.state} {club.zip_code} ({club.distance_miles.toFixed(1)} miles)
                    </Typography>
                    {club.available_technologies && club.available_technologies.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Technologies: {club.available_technologies.join(', ')}
                      </Typography>
                    )}
                  </Box>

                  {/* Right side - Club details */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end',
                      minWidth: '200px'
                    }}
                  >
                    {club.price_tier && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5,
                          bgcolor: 'primary.light',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        Price: {club.price_tier}
                      </Typography>
                    )}
                    {club.difficulty && (
                      <Typography 
                        variant="body2"
                        sx={{ 
                          mb: 0.5,
                          bgcolor: 
                            club.difficulty === 'Easy' ? 'success.light' : 
                            club.difficulty === 'Medium' ? 'warning.light' : 
                            'error.light',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        Difficulty: {club.difficulty}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  First
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
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
                        disabled={isLoading}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}
                
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
                <Button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Last
                </Button>
                <Typography variant="body2">
                  Page {currentPage} of {totalPages}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography>No clubs found matching your criteria.</Typography>
          )}
        </section>
      </div>
    </PageLayout>
  );
};

export default FindClub;
