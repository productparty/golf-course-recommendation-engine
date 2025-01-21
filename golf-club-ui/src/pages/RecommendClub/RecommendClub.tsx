import React, { useState } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, SelectChangeEvent } from '@mui/material';
import './RecommendClub.css';
import { useAuth } from '../../context/AuthContext';
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
  recommendation_score: number;
}

const RecommendClub: React.FC = () => {
  const { session } = useAuth();
  const [zipCode, setZipCode] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [recommendations, setRecommendations] = useState<GolfClub[]>([]);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async (pageNumber: number = 1) => {
    try {
      setIsLoading(true);
      if (!session) {
        setRecommendationError('You must be logged in to get recommendations.');
        return;
      }

      if (!zipCode) {
        setRecommendationError('Please enter a ZIP code');
        return;
      }

      const offset = (pageNumber - 1) * 5;
      
      const response = await fetch(
        `${config.API_URL}/api/get_recommendations/?` +
        new URLSearchParams({
          zip_code: zipCode,
          radius: radius.toString(),
          limit: '5',
          offset: offset.toString()
        }),
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      console.log('Recommendations response:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch recommendations');
      }

      if (data.results && Array.isArray(data.results)) {
        setRecommendations(data.results);
        setTotalPages(Math.max(1, data.total_pages || 1));
        setCurrentPage(pageNumber);
      } else {
        setRecommendationError('No recommendations found.');
      }
    } catch (err) {
      setRecommendationError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    fetchRecommendations(validPage);
  };

  return (
    <PageLayout title="Recommended Golf Clubs">
      <div className="content">
        <aside className="filters">
          <Typography variant="body1" gutterBottom>
            Get personalized golf club recommendations based on your profile preferences
          </Typography>
          <Box sx={{ 
            mt: 2,
            width: '100%',  // Make box full width
            '& .MuiTextField-root': { width: '100%' }, // Make TextField full width
            '& .MuiFormControl-root': { width: '100%' } // Make FormControl full width
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
            <Button 
              onClick={() => fetchRecommendations(1)}
              variant="contained"
              color="primary"
              sx={{ mt: 2, width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Get Recommendations'}
            </Button>
          </Box>
          {recommendationError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {recommendationError}
            </Typography>
          )}
        </aside>

        <section className="results">
          <Typography variant="h5" component="h2" gutterBottom>
            Recommendations
          </Typography>
          {recommendations.length > 0 ? (
            <>
              {recommendations.map((club) => (
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
                        mb: 0.5,
                        fontSize: {
                          xs: '1rem',     // Mobile
                          sm: '1.1rem',   // Tablet
                          md: '1.25rem'   // Desktop
                        },
                        lineHeight: 1.3
                      }}
                    >
                      {club.club_name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mb: 0.5,
                        fontSize: {
                          xs: '0.875rem',
                          sm: '0.9rem',
                          md: '1rem'
                        },
                        lineHeight: 1.4
                      }}
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
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'primary.main',
                        fontWeight: 'bold',
                        fontSize: {
                          xs: '0.9rem',
                          sm: '1rem',
                          md: '1.1rem'
                        }
                      }}
                    >
                      Recommendation Score: {club.recommendation_score.toFixed(1)}%
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
            <Typography>No recommendations found.</Typography>
          )}
        </section>
      </div>
    </PageLayout>
  );
};

export default RecommendClub;
