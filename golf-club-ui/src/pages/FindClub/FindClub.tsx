import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, SelectChangeEvent } from '@mui/material';
import './FindClub.css';
import { API_BASE_URL, debugApiConfig } from '../../utils/api';
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
  const [priceRange, setPriceRange] = useState<'' | '$' | '$$' | '$$$'>('');
  const [difficulty, setDifficulty] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
  const [findTechnologies, setFindTechnologies] = useState<string[]>([]);
  const [results, setResults] = useState<GolfClub[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clubError, setClubError] = useState<string | null>(null);

  const fetchClubs = async (pageNumber: number) => {
    try {
      if (!zipCode) {
        setClubError('Please enter a ZIP code');
        return;
      }

      setClubError(null);
      
      // Ensure pageNumber is valid
      const page = Math.max(1, pageNumber || 1);
      const offset = (page - 1) * 5;
      
      const apiUrl = `${API_BASE_URL}/find_clubs/`;
      const params = new URLSearchParams({
        zip_code: zipCode,
        radius: radius.toString(),
        limit: '5',
        offset: offset.toString()  // Now this will always be a valid number
      });

      // Add optional filters if selected
      if (priceRange) params.append('price_tier', priceRange);
      if (difficulty) params.append('difficulty', difficulty);
      if (findTechnologies.length > 0) params.append('technologies', findTechnologies.join(','));

      console.log('Fetching from:', `${apiUrl}?${params.toString()}`);

      const response = await fetch(`${apiUrl}?${params.toString()}`);
      const data = await response.json();

      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.detail?.message || 'Failed to fetch clubs');
      }

      if (data.results && Array.isArray(data.results)) {
        setResults(data.results);
        setTotalPages(Math.max(1, data.total_pages || 1));  // Ensure at least 1 page
        setCurrentPage(data.page || 1);  // Ensure valid current page
      } else {
        console.error('Unexpected response format:', data);
        setClubError('Unexpected response format from server');
      }

    } catch (err) {
      console.error('Error in fetchClubs:', err);
      setClubError(err instanceof Error ? err.message : 'Failed to fetch clubs');
    }
  };

  const handlePageChange = (newPage: number) => {
    // Ensure newPage is within valid range
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    fetchClubs(validPage);
  };

  const handleTechnologiesChange = (event: SelectChangeEvent<string[]>) => {
    const selectedOptions = event.target.value as string[];
    setFindTechnologies(selectedOptions);
  };

  useEffect(() => {
    debugApiConfig();
  }, []);

  return (
    <PageLayout title="Find Golf Clubs">
      <div className="content">
        <aside className="filters">
          <Typography variant="h4" component="h1" gutterBottom>
            Find Club
          </Typography>
          <Typography variant="body1" gutterBottom>
            Search for golf clubs in your area
          </Typography>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="ZIP Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              margin="normal"
              inputProps={{ maxLength: 5 }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Radius (miles)</InputLabel>
              <Select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              >
                {[1, 5, 10, 25, 50, 100].map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Price Range</InputLabel>
              <Select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as '' | '$' | '$$' | '$$$')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="$">$</MenuItem>
                <MenuItem value="$$">$$</MenuItem>
                <MenuItem value="$$$">$$$</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as '' | 'Easy' | 'Medium' | 'Hard')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Technologies</InputLabel>
              <Select
                multiple
                value={findTechnologies}
                onChange={handleTechnologiesChange}
              >
                {technologyOptions.map((tech) => (
                  <MenuItem key={tech} value={tech}>{tech}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              onClick={() => fetchClubs(1)} 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
            >
              Find Clubs
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
                    {club.available_technologies && club.available_technologies.length > 0 && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            fontStyle: 'italic',
                            mb: 0.5
                          }}
                        >
                          Available Technologies:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 0.5 }}>
                          {club.available_technologies.map((tech, idx) => (
                            <Typography
                              key={idx}
                              variant="body2"
                              sx={{
                                bgcolor: 'info.light',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem'
                              }}
                            >
                              {tech}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
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
                >
                  Next
                </Button>
                <Button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
                <Typography variant="body2">
                  Page {currentPage} of {totalPages}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography>No clubs found.</Typography>
          )}
        </section>
      </div>
    </PageLayout>
  );
};

export default FindClub;
