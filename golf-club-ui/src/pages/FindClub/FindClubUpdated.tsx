import './FindClub.css';
import React, { useState, useEffect } from 'react';
import { 
  Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, 
  Box, Alert, CircularProgress, SelectChangeEvent, Typography, Card,
  FormControlLabel, Switch, Divider, CardContent
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import ClubCard, { Club } from '../../components/ClubCard';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { supabase } from '../../lib/supabase';
import { InteractiveMap } from '../../components/InteractiveMap';
import { useNavigate, useLocation } from 'react-router-dom';

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

interface Props {
  className?: string;
}

const FindClubUpdated: React.FC<Props> = ({ className }) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
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

  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-98.5795, 39.8283]);
  const [isSticky, setIsSticky] = useState(false);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);

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

  const updateURL = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    navigate(`?${searchParams.toString()}`, { replace: true });
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
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to find clubs');
      }

      const data = await response.json();

      const coursesWithCoords = await Promise.all((data.results || []).map(async (course: Club) => {
        try {
          const response = await fetch(`https://api.zippopotam.us/us/${course.zip_code}`);
          const zipData = await response.json();
          
          return {
            ...course,
            latitude: Number(zipData.places[0].latitude),
            longitude: Number(zipData.places[0].longitude)
          };
        } catch (error) {
          console.error(`Failed to get coordinates for ${course.zip_code}:`, error);
          return course;
        }
      }));

      setClubs(coursesWithCoords);
      setTotalPages(Math.ceil(coursesWithCoords.length / ITEMS_PER_PAGE));
      setCurrentPage(1);

      if (sortBy) {
        handleSortChange({ target: { value: sortBy } } as SelectChangeEvent<SortOption>);
      }

      updateURL({
        zipCode: filters.zipCode,
        radius: filters.radius,
        page: currentPage.toString()
      });

      setFilteredClubs(coursesWithCoords);
    } catch (error: any) {
      console.error('Error finding clubs:', error);
      setError(error.message || 'Failed to find clubs');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPageClubs = () => {
    let filteredClubs = [...clubs];
    
    if (showOnlyFavorites) {
      filteredClubs = filteredClubs.filter(club => favorites.includes(club.id));
    }

    if (sortBy) {
      filteredClubs.sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            return (a.distance_miles || 0) - (b.distance_miles || 0);
          case 'price':
            return a.price_tier.localeCompare(b.price_tier);
          case 'difficulty':
            return a.difficulty.localeCompare(b.difficulty);
          default:
            return 0;
        }
      });
    }

    return filteredClubs;
  };

  const getPaginatedClubs = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return getCurrentPageClubs().slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    const value = event.target.value as SortOption;
    setSortBy(value);
    
    if (!value) {
      handleSearch();
      return;
    }
    
    const sortedClubs = [...clubs].sort((a, b) => {
      switch (value) {
        case 'distance':
          return (a.distance_miles || 0) - (b.distance_miles || 0);
        case 'price':
          const priceOrder: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3 };
          return (priceOrder[a.price_tier] || 0) - (priceOrder[b.price_tier] || 0);
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

  const fetchFavorites = async () => {
    if (!session?.user?.id) return;
    
    const { data, error } = await supabase
      .from('favorites')
      .select('golfclub_id')
      .eq('profile_id', session.user.id);
      
    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }
    
    setFavorites(data.map(fav => fav.golfclub_id));
  };

  const handleToggleFavorite = async (clubId: string) => {
    if (!session?.user?.id) return;

    const isFavorite = favorites.includes(clubId);
    
    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('profile_id', session.user.id)
        .eq('golfclub_id', clubId);
        
      if (error) {
        console.error('Error removing favorite:', error);
        return;
      }
      
      setFavorites(prev => prev.filter(id => id !== clubId));
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([
          { 
            profile_id: session.user.id,
            golfclub_id: clubId
          }
        ]);
        
      if (error) {
        console.error('Error adding favorite:', error);
        return;
      }
      
      setFavorites(prev => [...prev, clubId]);
    }
  };

  const handleMarkerClick = (clubId: string) => {
    navigate(`/clubs/${clubId}`);
  };

  useEffect(() => {
    fetchFavorites();
  }, [session?.user?.id]);

  useEffect(() => {
    let filteredClubs = [...clubs];
    if (showOnlyFavorites) {
      filteredClubs = filteredClubs.filter(club => favorites.includes(club.id));
    }
    setTotalPages(Math.ceil(filteredClubs.length / ITEMS_PER_PAGE));
  }, [clubs, showOnlyFavorites, favorites]);

  // Load search state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('findClubState');
    if (savedState) {
      const { savedFilters, savedClubs, savedPage, savedSortBy } = JSON.parse(savedState);
      setFilters(savedFilters);
      setClubs(savedClubs);
      setCurrentPage(savedPage);
      setSortBy(savedSortBy);
      setFilteredClubs(savedClubs);
    } else {
      // If no saved state, initialize from URL params
      const searchParams = new URLSearchParams(location.search);
      const initialFilters = {
        zipCode: searchParams.get('zipCode') || '',
        radius: searchParams.get('radius') || '25',
        preferred_price_range: searchParams.get('preferred_price_range') || '',
        preferred_difficulty: searchParams.get('preferred_difficulty') || '',
        number_of_holes: searchParams.get('number_of_holes') || '',
        club_membership: searchParams.get('club_membership') || '',
        driving_range: searchParams.get('driving_range') === 'true',
        putting_green: searchParams.get('putting_green') === 'true',
        chipping_green: searchParams.get('chipping_green') === 'true',
        practice_bunker: searchParams.get('practice_bunker') === 'true',
        restaurant: searchParams.get('restaurant') === 'true',
        lodging_on_site: searchParams.get('lodging_on_site') === 'true',
        motor_cart: searchParams.get('motor_cart') === 'true',
        pull_cart: searchParams.get('pull_cart') === 'true',
        golf_clubs_rental: searchParams.get('golf_clubs_rental') === 'true',
        club_fitting: searchParams.get('club_fitting') === 'true',
        golf_lessons: searchParams.get('golf_lessons') === 'true',
      };
      setFilters(initialFilters);
      setCurrentPage(Number(searchParams.get('page')) || 1);
      
      if (initialFilters.zipCode) {
        handleSearch();
      }
    }
  }, []);

  // Save search state to localStorage whenever it changes
  useEffect(() => {
    if (clubs.length > 0) {
      const stateToSave = {
        savedFilters: filters,
        savedClubs: clubs,
        savedPage: currentPage,
        savedSortBy: sortBy
      };
      localStorage.setItem('findClubState', JSON.stringify(stateToSave));
    }
  }, [filters, clubs, currentPage, sortBy]);

  // Clear saved state when filters are reset
  const handleClearSearch = () => {
    localStorage.removeItem('findClubState');
    setFilters({
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
    setClubs([]);
    setCurrentPage(1);
    setSortBy('');
    setFilteredClubs([]);
    navigate('.');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '1rem'
      }}
    >
      <PageLayout title="Find Club" titleProps={{ sx: { textAlign: 'center' } }}>
        <Box 
          component="div" 
          sx={{ className: `find-club ${className || ''}` }}
        >
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ mb: 4, textAlign: 'center' }}
          >
            Search and filter golf clubs based on your preferences and location.
          </Typography>

          <div className="content" style={{
            display: 'flex',
            gap: '2rem',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <aside className="filters" style={{
              width: '300px',
              position: 'sticky',
              top: '1rem',
              alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 2rem)',
              overflowY: 'auto',
              zIndex: 1,
              transition: 'all 0.3s ease',
              backgroundColor: 'white',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '4px'
            }}>
              <Typography variant="h6" gutterBottom>Filters</Typography>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                height: '100%'
              }}>
                {/* Location Search */}
                <Typography variant="subtitle1" gutterBottom>
                  Location
                </Typography>
                <TextField
                  fullWidth
                  label="Zip Code"
                  value={filters.zipCode}
                  onChange={handleTextChange('zipCode')}
                  placeholder="Enter ZIP code..."
                  size="small"
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth size="small">
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

                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={isLoading}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {isLoading ? 'Searching...' : 'Search Clubs'}
                </Button>

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

                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnlyFavorites}
                      onChange={(e) => {
                        setShowOnlyFavorites(e.target.checked);
                        setCurrentPage(1);
                      }}
                    />
                  }
                  label="Show Only Favorites"
                  sx={{ mb: 2 }}
                />
              </Box>
            </aside>

            <section className="results" style={{ 
              flex: 1,
              minWidth: 0,
              overflowY: 'auto',
              padding: '1rem'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6">Search Results</Typography>
                  {clubs.length > 0 && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={handleClearSearch}
                    >
                      Clear Search
                    </Button>
                  )}
                </Box>
                <FormControl sx={{ 
                  minWidth: { xs: '100%', sm: 200 }
                }}>
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
                  <Box sx={{ mb: 4, mt: 2 }}>
                    <InteractiveMap 
                      clubs={getPaginatedClubs()}
                      center={[mapCenter[0], mapCenter[1]]}
                      radius={Number(filters.radius)}
                      onMarkerClick={handleMarkerClick}
                      showNumbers={true}
                      key={JSON.stringify(filters)}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    {getPaginatedClubs().map((club, index) => (
                      <Grid item xs={12} key={club.id}>
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            borderRadius: 1,
                            boxShadow: 1,
                            padding: 2,
                            position: 'relative',
                          }}
                        >
                          <ClubCard 
                            club={club}
                            isFavorite={favorites.includes(club.id)}
                            onToggleFavorite={handleToggleFavorite}
                            showToggle={true}
                            index={index}
                            showScore={true}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': {
                                boxShadow: 3
                              }
                            }}
                            onClick={() => navigate(`/clubs/${club.id}`)}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

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
        </Box>
      </PageLayout>
    </Box>
  );
};

export default FindClubUpdated;
