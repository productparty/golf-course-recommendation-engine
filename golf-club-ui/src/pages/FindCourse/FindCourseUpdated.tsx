import React, { useState } from 'react';
import {
  Typography, TextField, Button, Card, CardContent,
  Grid, FormControl, InputLabel, Select, MenuItem,
  Divider, FormControlLabel, Switch, Box, SelectChangeEvent,
  CircularProgress, Alert
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { config } from '../../config';
import CourseCard from '../../components/CourseCard';
import { useAuth } from '../../context/AuthContext';

interface Course {
  id: string;
  name: string;
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

interface CourseFilters {
  zipCode: string;
  radius: string;
  // Course Basics
  preferred_price_range: string | null;
  number_of_holes: string | null;
  club_membership: string | null;
  // Skill and Difficulty
  skill_level: string | null;
  preferred_difficulty: string | null;
  // Amenities
  driving_range: boolean;
  putting_green: boolean;
  chipping_green: boolean;
  practice_bunker: boolean;
  restaurant: boolean;
  lodging_on_site: boolean;
  // Equipment and Services
  motor_cart: boolean;
  pull_cart: boolean;
  golf_clubs_rental: boolean;
  club_fitting: boolean;
  golf_lessons: boolean;
}

interface SortOption {
  value: keyof Course;
  label: string;
  transform?: (a: any, b: any) => number;
}

const FindCourseUpdated: React.FC = () => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<CourseFilters>({
    zipCode: '',
    radius: '25',
    preferred_price_range: null,
    number_of_holes: null,
    club_membership: null,
    skill_level: null,
    preferred_difficulty: null,
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

  const [sortBy, setSortBy] = useState<keyof Course>('distance_miles');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortOptions: SortOption[] = [
    { value: 'distance_miles', label: 'Distance' },
    { value: 'price_tier', label: 'Price' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'name', label: 'Name' },
  ];

  const handleTextChange = (field: keyof CourseFilters) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSelectChange = (field: keyof CourseFilters) => (
    event: SelectChangeEvent<string>
  ) => {
    setFilters(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSwitchChange = (field: keyof CourseFilters) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters(prev => ({ ...prev, [field]: event.target.checked }));
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
        ...(filters.preferred_price_range && { price_tier: filters.preferred_price_range }),
        ...(filters.preferred_difficulty && { difficulty: filters.preferred_difficulty }),
        ...(filters.number_of_holes && { number_of_holes: filters.number_of_holes }),
        ...(filters.club_membership && { club_membership: filters.club_membership }),
        ...(filters.driving_range && { driving_range: 'true' }),
        ...(filters.putting_green && { putting_green: 'true' }),
        ...(filters.chipping_green && { chipping_green: 'true' }),
        ...(filters.practice_bunker && { practice_bunker: 'true' }),
        ...(filters.restaurant && { restaurant: 'true' }),
        ...(filters.lodging_on_site && { lodging_on_site: 'true' }),
        ...(filters.motor_cart && { motor_cart: 'true' }),
        ...(filters.pull_cart && { pull_cart: 'true' }),
        ...(filters.golf_clubs_rental && { golf_clubs_rental: 'true' }),
        ...(filters.club_fitting && { club_fitting: 'true' }),
        ...(filters.golf_lessons && { golf_lessons: 'true' })
      });

      const response = await fetch(
        `${config.API_URL}/api/find_clubs/?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to search courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error searching courses:', error);
      setError('Failed to search courses');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedCourses = [...courses].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (sortBy === 'distance_miles') {
      return ((aVal as number) - (bVal as number)) * direction;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * direction;
    }
    
    return 0;
  });

  return (
    <PageLayout title="Find a Course">
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Location Search */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Location</Typography>
              <Divider sx={{ mb: 2 }} />
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
              </Grid>
            </Grid>

            {/* Course Basics */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Course Basics</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
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
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Club Type</InputLabel>
                    <Select
                      value={filters.club_membership || ''}
                      onChange={handleSelectChange('club_membership')}
                      label="Club Type"
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                      <MenuItem value="military">Military</MenuItem>
                      <MenuItem value="municipal">Municipal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Skill and Difficulty */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Skill and Difficulty</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Skill Level</InputLabel>
                    <Select
                      value={filters.skill_level || ''}
                      onChange={handleSelectChange('skill_level')}
                      label="Skill Level"
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Course Difficulty</InputLabel>
                    <Select
                      value={filters.preferred_difficulty || ''}
                      onChange={handleSelectChange('preferred_difficulty')}
                      label="Course Difficulty"
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Amenities */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Amenities</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[
                  { field: 'driving_range', label: 'Driving Range' },
                  { field: 'putting_green', label: 'Putting Green' },
                  { field: 'chipping_green', label: 'Chipping Green' },
                  { field: 'practice_bunker', label: 'Practice Bunker' },
                  { field: 'restaurant', label: 'Restaurant' },
                  { field: 'lodging_on_site', label: 'Lodging On-Site' },
                ].map(({ field, label }) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters[field as keyof CourseFilters] as boolean}
                          onChange={handleSwitchChange(field as keyof CourseFilters)}
                        />
                      }
                      label={label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Equipment and Services */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Equipment and Services</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[
                  { field: 'motor_cart', label: 'Motor Cart' },
                  { field: 'pull_cart', label: 'Pull Cart' },
                  { field: 'golf_clubs_rental', label: 'Golf Club Rentals' },
                  { field: 'club_fitting', label: 'Club Fitting' },
                  { field: 'golf_lessons', label: 'Golf Lessons' },
                ].map(({ field, label }) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters[field as keyof CourseFilters] as boolean}
                          onChange={handleSwitchChange(field as keyof CourseFilters)}
                        />
                      }
                      label={label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={isLoading}
              size="large"
            >
              {isLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Searching...
                </>
              ) : (
                'Search Courses'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {courses.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Found {courses.length} courses
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <FormControl size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value as keyof Course)}
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Direction</InputLabel>
              <Select
                value={sortDirection}
                label="Direction"
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Grid container spacing={2}>
            {sortedCourses.map((course) => (
              <Grid item xs={12} md={6} key={course.id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </PageLayout>
  );
};

export default FindCourseUpdated; 