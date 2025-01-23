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
  first_name?: string;
  last_name?: string;
  handicap_index?: number;
  skill_level: string;
  preferred_difficulty: string;
  preferred_price_range: string;
  play_frequency: string;
  club_id?: string;
  preferred_tees?: string;
  // New fields
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

const GolferProfileUpdated: React.FC = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<GolferProfile>({
    id: '',
    user_id: session?.user.id || '',
    skill_level: '',
    preferred_difficulty: '',
    preferred_price_range: '',
    play_frequency: '',
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
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  const handleChange = (field: keyof GolferProfile) => (
    event: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = 'checked' in event.target 
      ? event.target.checked 
      : event.target.value;
    setProfile({ ...profile, [field]: value });
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
                      value={profile.number_of_holes}
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
                      value={profile.club_membership}
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
                      value={profile.preferred_price_range}
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
                          onChange={handleChange(field as keyof GolferProfile)}
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
                          onChange={handleChange(field as keyof GolferProfile)}
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
                      value={profile.skill_level}
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
                      value={profile.preferred_difficulty}
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
                      value={profile.play_frequency}
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
