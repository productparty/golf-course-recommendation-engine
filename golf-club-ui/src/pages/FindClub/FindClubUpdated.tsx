import React, { useState } from 'react';
import { Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, Alert, CircularProgress, SelectChangeEvent, Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import ClubCard from '../../components/ClubCard';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';

interface Club {
  id: string;
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  distance_miles: number;
  price_tier: string;
  difficulty: string;
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

interface Filters {
  zipCode: string;
  radius: string;
  preferred_price_range?: string;
  preferred_difficulty?: string;
}

const FindClubUpdated: React.FC = () => {
  const { session } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 4;
  
  const [filters, setFilters] = useState<Filters>({
    zipCode: '',
    radius: '25'
  });

  const handleTextChange = (name: keyof Filters) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters(prev => ({ ...prev, [name]: event.target.value }));
  };

  const handleSelectChange = (name: keyof Filters) => (
    event: SelectChangeEvent
  ) => {
    setFilters(prev => ({ ...prev, [name]: event.target.value }));
  };

  const handleSearch = async () => {
    if (!filters.zipCode) {
      setError('Please enter a zip code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams({
        zip_code: filters.zipCode,
        radius: filters.radius,
        limit: '25', // Maximum total results
        ...(filters.preferred_price_range && { price_tier: filters.preferred_price_range }),
        ...(filters.preferred_difficulty && { difficulty: filters.preferred_difficulty })
      });

      const response = await fetch(
        `${config.API_URL}/api/find_clubs/?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to find clubs');
      }

      const data = await response.json();
      setClubs(data.results || []);
      setTotalPages(Math.ceil((data.results || []).length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Error finding clubs:', error);
      setError(error.message || 'Failed to find clubs');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPageClubs = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return clubs.slice(start, start + ITEMS_PER_PAGE);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  return (
    <PageLayout title="Find Golf Clubs">
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Zip Code"
              value={filters.zipCode}
              onChange={handleTextChange('zipCode')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Search Radius</InputLabel>
              <Select
                value={filters.radius}
                onChange={handleSelectChange('radius')}
                label="Search Radius"
              >
                <MenuItem value="10">10 miles</MenuItem>
                <MenuItem value="25">25 miles</MenuItem>
                <MenuItem value="50">50 miles</MenuItem>
                <MenuItem value="100">100 miles</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Price Range</InputLabel>
              <Select
                value={filters.preferred_price_range || ''}
                onChange={handleSelectChange('preferred_price_range')}
                label="Price Range"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="$">$</MenuItem>
                <MenuItem value="$$">$$</MenuItem>
                <MenuItem value="$$$">$$$</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.preferred_difficulty || ''}
                onChange={handleSelectChange('preferred_difficulty')}
                label="Difficulty"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
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
                Searching...
              </>
            ) : (
              'Search Clubs'
            )}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {clubs.length > 0 && (
        <>
          <Grid container spacing={2}>
            {getCurrentPageClubs().map((club) => (
              <Grid item xs={12} key={club.id}>
                <ClubCard club={club} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              variant="outlined"
            >
              First
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outlined"
            >
              Previous
            </Button>
            
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
              variant="outlined"
            >
              Next
            </Button>
            <Button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              variant="outlined"
            >
              Last
            </Button>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ mt: 1, textAlign: 'center' }}
          >
            Page {currentPage} of {totalPages}
          </Typography>
        </>
      )}
    </PageLayout>
  );
};

export default FindClubUpdated; 