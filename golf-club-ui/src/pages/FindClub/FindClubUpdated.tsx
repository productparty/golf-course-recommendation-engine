import './FindClub.css';
import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { 
  Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, 
  Box, Alert, CircularProgress, SelectChangeEvent, Typography, Card,
  FormControlLabel, Switch, Divider, CardContent, useTheme, useMediaQuery, IconButton, SwipeableDrawer, Paper
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import PageLayout from '../../components/PageLayout';
import ClubCard, { Club } from '../../components/ClubCard';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { supabase } from '../../lib/supabase';
import { InteractiveMap } from '../../components/InteractiveMap';
import { useNavigate, useLocation } from 'react-router-dom';
import { divIcon } from 'leaflet';
import { Marker } from 'react-leaflet';

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

const FindClubUpdated = forwardRef<HTMLDivElement, Props>(({ className }, ref) => {
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [isSticky, setIsSticky] = useState(false);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const handleTextChange = (name: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [name]: event.target.value }));
  };

  const handleSelectChange = (name: keyof Filters) => (event: SelectChangeEvent) => {
    setFilters(prev => ({ ...prev, [name]: event.target.value }));
  };

  const handleSwitchChange = (name: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [name]: event.target.checked }));
  };

  const handleClearSearch = () => {
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
    setError('');
    setSortBy('');
    setCurrentPage(1);
    navigate('/find-club');
  };

  const updateURL = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    navigate(`?${searchParams.toString()}`, { replace: true });
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!filters.zipCode) {
      setError('Please enter a zip code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Log the request for debugging
      console.log('Searching with filters:', filters);
      
      const queryParams = new URLSearchParams({
        zip_code: filters.zipCode,
        radius: filters.radius,
        limit: '100', // Increase limit to ensure we get results
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

      // Log the full URL for debugging
      const apiUrl = `${config.API_URL}/api/find_clubs/?${queryParams}`;
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Log the response status
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || 'Failed to find clubs');
        } catch (e) {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Search results:', data);
      
      if (data.results && Array.isArray(data.results)) {
        // Transform the results to match the expected Club format
        const transformedClubs = data.results.map((club: any) => ({
          id: club.id || club.global_id || club.golfclub_id,
          global_id: club.id || club.global_id || club.golfclub_id,
          club_name: club.club_name || club.name,
          address: club.address,
          city: club.city,
          state: club.state,
          zip_code: club.zip_code,
          latitude: typeof club.latitude === 'string' ? parseFloat(club.latitude) : club.latitude || 0,
          longitude: typeof club.longitude === 'string' ? parseFloat(club.longitude) : club.longitude || 0,
          price_tier: club.price_tier || '$',
          difficulty: club.difficulty || 'Medium',
          number_of_holes: club.number_of_holes || '18',
          distance_miles: club.distance_miles,
          club_membership: club.club_membership || 'Public',
          driving_range: Boolean(club.driving_range),
          putting_green: Boolean(club.putting_green),
          chipping_green: Boolean(club.chipping_green),
          practice_bunker: Boolean(club.practice_bunker),
          restaurant: Boolean(club.restaurant),
          lodging_on_site: Boolean(club.lodging_on_site),
          motor_cart: Boolean(club.motor_cart),
          pull_cart: Boolean(club.pull_cart),
          golf_clubs_rental: Boolean(club.golf_clubs_rental),
          club_fitting: Boolean(club.club_fitting),
          golf_lessons: Boolean(club.golf_lessons),
        }));
        
        setClubs(transformedClubs);
        setTotalPages(Math.ceil(transformedClubs.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
        
        if (transformedClubs.length > 0) {
          // Find the first club with valid coordinates
          const clubWithCoords = transformedClubs.find((club: Club) => 
            club.latitude && club.longitude && 
            !isNaN(club.latitude) && !isNaN(club.longitude) &&
            Math.abs(club.latitude) <= 90 && Math.abs(club.longitude) <= 180
          );
          
          if (clubWithCoords) {
            setMapCenter([clubWithCoords.latitude, clubWithCoords.longitude]);
            console.log('Setting map center to:', clubWithCoords.latitude, clubWithCoords.longitude);
          } else {
            // Default to a US center if no valid coordinates
            setMapCenter([39.8283, -98.5795]);
          }
        }
        
        // Update URL with search parameters
        const urlParams: Record<string, string> = {
          zipCode: filters.zipCode,
          radius: filters.radius
        };
        
        if (filters.preferred_price_range) urlParams.price = filters.preferred_price_range;
        if (filters.preferred_difficulty) urlParams.difficulty = filters.preferred_difficulty;
        if (filters.number_of_holes) urlParams.holes = filters.number_of_holes;
        
        updateURL(urlParams);
      } else if (data.clubs && Array.isArray(data.clubs)) {
        // Original handling for clubs array
        setClubs(data.clubs);
        setTotalPages(Math.ceil(data.clubs.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
        
        if (data.clubs.length > 0 && data.center) {
          setMapCenter([data.center.lat, data.center.lng]);
        }
        
        // Update URL with search parameters
        const urlParams: Record<string, string> = {
          zipCode: filters.zipCode,
          radius: filters.radius
        };
        
        if (filters.preferred_price_range) urlParams.price = filters.preferred_price_range;
        if (filters.preferred_difficulty) urlParams.difficulty = filters.preferred_difficulty;
        if (filters.number_of_holes) urlParams.holes = filters.number_of_holes;
        
        updateURL(urlParams);
      } else {
        setClubs([]);
        setError('No clubs found matching your criteria');
      }
    } catch (err) {
      console.error('Error searching clubs:', err);
      setError(err instanceof Error ? err.message : 'Failed to search clubs');
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

  const getPaginatedClubs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return getCurrentPageClubs().slice(startIndex, endIndex);
  }, [currentPage, clubs, showOnlyFavorites, sortBy]);

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
    
    setFavorites(data.map((fav: { golfclub_id: string }) => fav.golfclub_id));
  };

  const handleToggleFavorite = async (clubId: string) => {
    if (!session?.user?.id) return;

    const isFavorite = favorites.includes(clubId);
    
    if (isFavorite) {
      // Remove from favorites
      await supabase
        .from('favorites')
        .delete()
        .eq('profile_id', session.user.id)
        .eq('golfclub_id', clubId);
    } else {
      // Add to favorites
      await supabase
        .from('favorites')
        .insert([
          { 
            profile_id: session.user.id,
            golfclub_id: clubId
          }
        ]);
    }
    
    // Refresh favorites list
    fetchFavorites();
  };

  const handleMarkerClick = (clubId: string) => {
    console.log('Navigating to club detail with ID:', clubId);
    // Use global_id for navigation if available
    const club = clubs.find(c => c.id === clubId || c.global_id === clubId);
    if (club) {
      navigate(`/club-detail/${club.global_id || club.id}`);
    } else {
      console.error('Club not found with ID:', clubId);
    }
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

  useEffect(() => {
    let savedState = null;
    if (typeof localStorage !== 'undefined') {
      savedState = localStorage.getItem('findClubState');
    }
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

  useEffect(() => {
    if (clubs.length > 0) {
      const stateToSave = {
        savedFilters: filters,
        savedClubs: clubs,
        savedPage: currentPage,
        savedSortBy: sortBy
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('findClubState', JSON.stringify(stateToSave));
      }
    }
  }, [filters, clubs, currentPage, sortBy]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (clubs.length > 0) {
      console.log('Current clubs data:', clubs);
      console.log('Paginated clubs:', getPaginatedClubs);
      
      // Check if clubs have valid coordinates
      const validCoords = clubs.filter(club => 
        club.latitude && club.longitude && 
        !isNaN(club.latitude) && !isNaN(club.longitude) &&
        Math.abs(club.latitude) <= 90 && Math.abs(club.longitude) <= 180
      );
      
      console.log('Clubs with valid coordinates:', validCoords.length);
      
      if (validCoords.length > 0) {
        console.log('First valid club coordinates:', validCoords[0].latitude, validCoords[0].longitude);
      }
    }
  }, [clubs, getPaginatedClubs]);

  // Add this custom marker style
  const createCustomMarker = (number: number) => {
    return divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: #1976d2;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${number}</div>`,
    });
  };

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: { xs: '0.5rem', sm: '1rem' }
      }}
    >
      <PageLayout title="Find Club" titleProps={{ sx: { textAlign: 'center' } }}>
        <Box sx={{ className: `find-club ${className || ''}` }}>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ mb: 4, textAlign: 'center' }}
          >
            Search and filter golf clubs based on your preferences and location.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, md: 0 },
                display: 'block' // Ensure it's always displayed
              }}>
                <Typography variant="h6" gutterBottom>
                  Find Club Search and Filter
                </Typography>
                
                {/* Make sure form fields are properly sized for mobile */}
                <Box component="form" onSubmit={handleSearch} sx={{ mt: 2 }}>
                  <TextField
                    label="Zip Code"
                    fullWidth
                    margin="normal"
                    value={filters.zipCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange('zipCode')(e)}
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                    <InputLabel id="radius-label">Search Radius (miles)</InputLabel>
                    <Select
                      labelId="radius-label"
                      value={filters.radius}
                      onChange={(e) => handleSelectChange('radius')(e)}
                      label="Search Radius (miles)"
                    >
                      <MenuItem value="10">10 miles</MenuItem>
                      <MenuItem value="25">25 miles</MenuItem>
                      <MenuItem value="50">50 miles</MenuItem>
                      <MenuItem value="100">100 miles</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                    <InputLabel id="price-range-label">Price Range</InputLabel>
                    <Select
                      labelId="price-range-label"
                      value={filters.preferred_price_range || ''}
                      onChange={(e) => handleSelectChange('preferred_price_range')(e)}
                      label="Price Range"
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="$">$ (Budget)</MenuItem>
                      <MenuItem value="$$">$$ (Moderate)</MenuItem>
                      <MenuItem value="$$$">$$$ (Premium)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                    <InputLabel id="difficulty-label">Difficulty</InputLabel>
                    <Select
                      labelId="difficulty-label"
                      value={filters.preferred_difficulty || ''}
                      onChange={(e) => handleSelectChange('preferred_difficulty')(e)}
                      label="Difficulty"
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="Beginner">Beginner</MenuItem>
                      <MenuItem value="Intermediate">Intermediate</MenuItem>
                      <MenuItem value="Advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                    <InputLabel id="holes-label">Number of Holes</InputLabel>
                    <Select
                      labelId="holes-label"
                      value={filters.number_of_holes || ''}
                      onChange={(e) => handleSelectChange('number_of_holes')(e)}
                      label="Number of Holes"
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="9">9 Holes</MenuItem>
                      <MenuItem value="18">18 Holes</MenuItem>
                      <MenuItem value="27">27 Holes</MenuItem>
                      <MenuItem value="36">36 Holes</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                    <InputLabel id="membership-label">Membership Type</InputLabel>
                    <Select
                      labelId="membership-label"
                      value={filters.club_membership || ''}
                      onChange={(e) => handleSelectChange('club_membership')(e)}
                      label="Membership Type"
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="Public">Public</MenuItem>
                      <MenuItem value="Private">Private</MenuItem>
                      <MenuItem value="Semi-Private">Semi-Private</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Amenities</Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.driving_range}
                            onChange={(e) => handleSwitchChange('driving_range')(e)}
                          />
                        }
                        label="Driving Range"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.putting_green}
                            onChange={(e) => handleSwitchChange('putting_green')(e)}
                          />
                        }
                        label="Putting Green"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.chipping_green}
                            onChange={(e) => handleSwitchChange('chipping_green')(e)}
                          />
                        }
                        label="Chipping Green"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.practice_bunker}
                            onChange={(e) => handleSwitchChange('practice_bunker')(e)}
                          />
                        }
                        label="Practice Bunker"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.restaurant}
                            onChange={(e) => handleSwitchChange('restaurant')(e)}
                          />
                        }
                        label="Restaurant"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.lodging_on_site}
                            onChange={(e) => handleSwitchChange('lodging_on_site')(e)}
                          />
                        }
                        label="Lodging"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.motor_cart}
                            onChange={(e) => handleSwitchChange('motor_cart')(e)}
                          />
                        }
                        label="Motor Cart"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.pull_cart}
                            onChange={(e) => handleSwitchChange('pull_cart')(e)}
                          />
                        }
                        label="Pull Cart"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.golf_clubs_rental}
                            onChange={(e) => handleSwitchChange('golf_clubs_rental')(e)}
                          />
                        }
                        label="Club Rental"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.club_fitting}
                            onChange={(e) => handleSwitchChange('club_fitting')(e)}
                          />
                        }
                        label="Club Fitting"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!filters.golf_lessons}
                            onChange={(e) => handleSwitchChange('golf_lessons')(e)}
                          />
                        }
                        label="Golf Lessons"
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ 
                    mt: 3, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1
                  }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      fullWidth
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={handleClearSearch}
                    >
                      Clear
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            {/* Results section */}
            <Grid item xs={12} md={9}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                gap: 2,
                mb: 2
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
                  {filters.zipCode && filters.radius && (
                    <Box sx={{ mb: 4, mt: 2, height: '400px' }}>
                      <InteractiveMap
                        clubs={getPaginatedClubs.filter(club => 
                          club.latitude && club.longitude && 
                          !isNaN(club.latitude) && !isNaN(club.longitude) &&
                          Math.abs(club.latitude) <= 90 && Math.abs(club.longitude) <= 180
                        )}
                        center={mapCenter}
                        radius={Number(filters.radius)}
                        onMarkerClick={handleMarkerClick}
                        showNumbers={true}
                        initialZoom={8}
                        key={`map-${filters.zipCode}-${filters.radius}-${currentPage}`}
                      />
                    </Box>
                  )}
                  <Grid container spacing={{ xs: 1, md: 2 }}>
                    {getPaginatedClubs.map((club: Club, index: number) => (
                      <Grid item xs={12} key={club.id}>
                        <Box sx={{
                          backgroundColor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 1,
                          p: { xs: 1, md: 2 }
                        }}>
                          <ClubCard 
                            club={club}
                            isFavorite={favorites.includes(club.id)}
                            onToggleFavorite={handleToggleFavorite}
                            showToggle={true}
                            index={index}
                            showScore={true}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { boxShadow: 3 }
                            }}
                            onClick={() => {
                              console.log('Navigating to club detail with ID:', club.id);
                              navigate(`/club-detail/${club.global_id || club.id}`);
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ 
                    mt: 3, 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'center', 
                    gap: 1 
                  }}>
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
            </Grid>
          </Grid>
        </Box>
      </PageLayout>
    </Box>
  );
});

export default FindClubUpdated;
