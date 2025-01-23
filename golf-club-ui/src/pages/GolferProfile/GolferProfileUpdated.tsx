import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Box, 
  SelectChangeEvent,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Switch,
  Divider
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';
import { config } from '../../config';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface GolferProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  handicap_index: number | null;
  preferred_price_range: string | null;
  preferred_difficulty: string | null;
  skill_level: string | null;
  play_frequency: string | null;
  club_id: string | null;
  club_name: string | null;
  preferred_tees: string | null;
  number_of_holes: string | null;
  club_membership: string | null;
  driving_range: boolean | null;
  putting_green: boolean | null;
  chipping_green: boolean | null;
  practice_bunker: boolean | null;
  restaurant: boolean | null;
  lodging_on_site: boolean | null;
  motor_cart: boolean | null;
  pull_cart: boolean | null;
  golf_clubs_rental: boolean | null;
  club_fitting: boolean | null;
  golf_lessons: boolean | null;
}

const GolferProfileUpdated: React.FC = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<GolferProfile>({
    id: '',
    user_id: session?.user.id || '',
    email: session?.user.email || '',
    first_name: null,
    last_name: null,
    handicap_index: null,
    preferred_price_range: null,
    preferred_difficulty: null,
    skill_level: null,
    play_frequency: null,
    club_id: null,
    club_name: null,
    preferred_tees: null,
    number_of_holes: null,
    club_membership: null,
    driving_range: null,
    putting_green: null,
    chipping_green: null,
    practice_bunker: null,
    restaurant: null,
    lodging_on_site: null,
    motor_cart: null,
    pull_cart: null,
    golf_clubs_rental: null,
    club_fitting: null,
    golf_lessons: null,
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  useEffect(() => {
    if (session?.user.id) {
      console.log('Fetching profile for user:', session.user.id);
      fetchProfile();
    } else {
      console.log('No session found');
      setIsLoading(false);
    }
  }, [session?.user.id]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      console.log('Making Supabase request...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Profile data received:', data);
      if (data) {
        setProfile(prev => ({
          ...prev,
          ...data,
          email: session?.user.email || prev.email,
          // Convert undefined to null for all boolean fields
          driving_range: data.driving_range ?? null,
          putting_green: data.putting_green ?? null,
          chipping_green: data.chipping_green ?? null,
          practice_bunker: data.practice_bunker ?? null,
          restaurant: data.restaurant ?? null,
          lodging_on_site: data.lodging_on_site ?? null,
          motor_cart: data.motor_cart ?? null,
          pull_cart: data.pull_cart ?? null,
          golf_clubs_rental: data.golf_clubs_rental ?? null,
          club_fitting: data.club_fitting ?? null,
          golf_lessons: data.golf_lessons ?? null,
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          user_id: session?.user.id,
        });

      if (error) throw error;
      setSuccess('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Error saving profile');
    }
  };

  const handleTextChange = (field: keyof GolferProfile) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'handicap_index' 
      ? Number(event.target.value) || null 
      : event.target.value;
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (field: keyof GolferProfile) => (
    event: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = 'checked' in event.target 
      ? event.target.checked 
      : event.target.value || null;
    setProfile({ ...profile, [field]: value });
  };

  const handleSwitchChange = (field: keyof GolferProfile) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  if (isLoading) {
    return (
      <PageLayout title="Golfer Profile">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Golfer Profile">
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Email: {profile.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profile.first_name || ''}
                    onChange={handleTextChange('first_name')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profile.last_name || ''}
                    onChange={handleTextChange('last_name')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Handicap Index"
                    type="number"
                    value={profile.handicap_index || ''}
                    onChange={handleTextChange('handicap_index')}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* General Course Attributes */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                General Course Attributes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Typography>Number of Holes</Typography>
                    <Select
                      value={profile.number_of_holes || ''}
                      onChange={handleChange('number_of_holes')}
                    >
                      <MenuItem value="9">9 Holes</MenuItem>
                      <MenuItem value="18">18 Holes</MenuItem>
                      <MenuItem value="any">Any</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Typography>Club Membership</Typography>
                    <Select
                      value={profile.club_membership || ''}
                      onChange={handleChange('club_membership')}
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                      <MenuItem value="military">Military</MenuItem>
                      <MenuItem value="municipal">Municipal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <Typography>Preferred Price Range</Typography>
                    <Select
                      value={profile.preferred_price_range || ''}
                      onChange={handleChange('preferred_price_range')}
                    >
                      <MenuItem value="$">$</MenuItem>
                      <MenuItem value="$$">$$</MenuItem>
                      <MenuItem value="$$$">$$$</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Amenities and Facilities */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Amenities and Facilities
              </Typography>
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
                  <Grid item xs={12} sm={4} key={field}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile[field as keyof GolferProfile] as boolean}
                          onChange={handleSwitchChange(field as keyof GolferProfile)}
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
              <Typography variant="h6" gutterBottom>
                Equipment and Services
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[
                  { field: 'motor_cart', label: 'Motor Cart' },
                  { field: 'pull_cart', label: 'Pull Cart' },
                  { field: 'golf_clubs_rental', label: 'Golf Club Rentals' },
                  { field: 'club_fitting', label: 'Club Fitting' },
                  { field: 'golf_lessons', label: 'Golf Lessons' },
                ].map(({ field, label }) => (
                  <Grid item xs={12} sm={4} key={field}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile[field as keyof GolferProfile] as boolean}
                          onChange={handleSwitchChange(field as keyof GolferProfile)}
                        />
                      }
                      label={label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Skill and Play Style */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Skill and Play Style
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <Typography>Skill Level</Typography>
                    <Select
                      value={profile.skill_level || ''}
                      onChange={handleChange('skill_level')}
                    >
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <Typography>Preferred Difficulty</Typography>
                    <Select
                      value={profile.preferred_difficulty || ''}
                      onChange={handleChange('preferred_difficulty')}
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <Typography>Play Frequency</Typography>
                    <Select
                      value={profile.play_frequency || ''}
                      onChange={handleChange('play_frequency')}
                    >
                      <MenuItem value="rarely">Rarely</MenuItem>
                      <MenuItem value="sometimes">Sometimes</MenuItem>
                      <MenuItem value="often">Often</MenuItem>
                      <MenuItem value="very_often">Very Often</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
            >
              Save Profile
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default GolferProfileUpdated;
