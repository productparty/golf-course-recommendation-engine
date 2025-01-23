import React, { useState } from 'react';
import { 
  Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, 
  Box, Alert, CircularProgress, SelectChangeEvent, Typography, Card,
  FormControlLabel, Switch, Divider
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import ClubCard from '../../components/ClubCard';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import './FindClub.css';

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
  number_of_holes?: string;
  club_membership?: string;
  driving_range?: boolean;
  putting_green?: boolean;
  chipping_green?: boolean;
  practice_bunker?: boolean;
  restaurant?: boolean;
  lodging_on_site?: boolean;
  motor_cart?: boolean;
  pull_cart?: boolean;
  golf_clubs_rental?: boolean;
  club_fitting?: boolean;
  golf_lessons?: boolean;
}

type SortOption = 'distance' | 'price' | 'difficulty' | '';

const FindClubUpdated: React.FC = () => {
  const { session } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 4;
  
  const [sortBy, setSortBy] = useState<SortOption>('');
  
  const [filters, setFilters] = useState<Filters>({
    zipCode: '',
    radius: '25',
    preferred_price_range: '',
    preferred_difficulty: '',
    number_of_holes: '',
    club_membership: '',
    driving_range: false,
    putting_green: false,
    chipping_green: false,
    practice_bunker: false,
    restaurant: false,
    lodging_on_site: false,
    motor_cart: false,
    pull_cart: false,
    golf_clubs_rental: false,
    club_fitting: false,
    golf_lessons: false,
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
        limit: '25',
      });

      if (filters.preferred_price_range) {
        queryParams.append('price_tier', filters.preferred_price_range);
      }
      if (filters.preferred_difficulty) {
        queryParams.append('difficulty', filters.preferred_difficulty);
      }
      if (filters.number_of_holes) {
        queryParams.append('number_of_holes', filters.number_of_holes);
      }
      if (filters.club_membership) {
        queryParams.append('club_membership', filters.club_membership);
      }

      const booleanFilters = [
        'driving_range', 'putting_green', 'chipping_green', 'practice_bunker',
        'restaurant', 'lodging_on_site', 'motor_cart', 'pull_cart',
        'golf_clubs_rental', 'club_fitting', 'golf_lessons'
      ];

      booleanFilters.forEach(filter => {
        if (filters[filter as keyof Filters]) {
          queryParams.append(filter, 'true');
        }
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

      if (sortBy) {
        handleSortChange({ target: { value: sortBy } } as SelectChangeEvent<SortOption>);
      }
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

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    const value = event.target.value as SortOption;
    setSortBy(value);
    
    const sortedClubs = [...clubs].sort((a, b) => {
      switch (value) {
        case 'distance':
          return a.distance_miles - b.distance_miles;
        case 'price':
          return (a.price_tier?.length || 0) - (b.price_tier?.length || 0);
        case 'difficulty':
          const difficultyOrder: Record<string, number> = { 
            'Easy': 1, 
            'Medium': 2, 
            'Hard': 3 
          };
          const aDifficulty = difficultyOrder[a.difficulty || ''] || 0;
          const bDifficulty = difficultyOrder[b.difficulty || ''] || 0;
          return aDifficulty - bDifficulty;
        default:
          return 0;
      }
    });
    
    setClubs(sortedClubs);
  };

  return (
    <PageLayout title="Find Golf Clubs">
      <div className="content">
        <aside className="filters">
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Box sx={{ width: '100%' }}>
            {/* Basic Search */}
            <TextField
              fullWidth
              label="Zip Code"
              value={filters.zipCode}
              onChange={handleTextChange('zipCode')}
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
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

            <Divider sx={{ my: 2 }} />
            
            {/* Course Info */}
            <Typography variant="subtitle1" gutterBottom>Course Info</Typography>
            <FormControl fullWidth margin="normal">
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

            <FormControl fullWidth margin="normal">
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

            <FormControl fullWidth margin="normal">
              <InputLabel>Number of Holes</InputLabel>
              <Select
                value={filters.number_of_holes || ''}
                onChange={handleSelectChange('number_of_holes')}
                label="Number of Holes"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="9">9 Holes</MenuItem>
                <MenuItem value="18">18 Holes</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Club Membership</InputLabel>
              <Select
                value={filters.club_membership || ''}
                onChange={handleSelectChange('club_membership')}
                label="Club Membership"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="military">Military</MenuItem>
                <MenuItem value="municipal">Municipal</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            {/* Amenities & Facilities */}
            <Typography variant="subtitle1" gutterBottom>
              Amenities & Facilities
            </Typography>
            {[
              { field: 'driving_range', label: 'Driving Range' },
              { field: 'putting_green', label: 'Putting Green' },
              { field: 'chipping_green', label: 'Chipping Green' },
              { field: 'practice_bunker', label: 'Practice Bunker' },
              { field: 'restaurant', label: 'Restaurant' },
              { field: 'lodging_on_site', label: 'Lodging On-Site' },
            ].map(({ field, label }) => (
              <FormControlLabel
                key={field}
                control={
                  <Switch
                    checked={!!filters[field as keyof Filters]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      [field]: e.target.checked
                    }))}
                  />
                }
                label={label}
              />
            ))}

            <Divider sx={{ my: 2 }} />

            {/* Equipment & Services */}
            <Typography variant="subtitle1" gutterBottom>
              Equipment & Services
            </Typography>
            {[
              { field: 'motor_cart', label: 'Motor Cart' },
              { field: 'pull_cart', label: 'Pull Cart' },
              { field: 'golf_clubs_rental', label: 'Club Rental' },
              { field: 'club_fitting', label: 'Club Fitting' },
              { field: 'golf_lessons', label: 'Golf Lessons' },
            ].map(({ field, label }) => (
              <FormControlLabel
                key={field}
                control={
                  <Switch
                    checked={!!filters[field as keyof Filters]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      [field]: e.target.checked
                    }))}
                  />
                }
                label={label}
              />
            ))}

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={isLoading}
              fullWidth
              sx={{ mt: 2 }}
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
        </aside>

        <section className="results">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Search Results</Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
                size="small"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="distance">Distance</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="difficulty">Difficulty</MenuItem>
              </Select>
            </FormControl>
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
        </section>
      </div>
    </PageLayout>
  );
};

export default FindClubUpdated; 