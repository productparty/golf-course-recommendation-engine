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
  CircularProgress
} from '@mui/material';
import { useAuth } from '../src/context/AuthContext';
import PageLayout from '../src/components/PageLayout';
import { config } from '../src/config';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';

interface GolferProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  handicap_index: number | null;
  preferred_price_range: string | null;
  preferred_difficulty: string | null;
  skill_level: string | null;
  play_frequency: string | null;
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

const GolferProfile: React.FC = () => {
  const { session, signOut, getToken } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GolferProfile>({
    id: '',
    email: '',
    first_name: null,
    last_name: null,
    handicap_index: null,
    preferred_price_range: null,
    preferred_difficulty: null,
    skill_level: null,
    play_frequency: null,
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

  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${config.API_URL}/api/profiles/current`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      if (!session?.user?.id) {
        throw new Error('No user session found');
      }

      // Validate required fields
      if (!profile.email) {
        throw new Error('Email is required');
      }

      const dataToSave = {
        email: profile.email,
        first_name: profile.first_name?.trim() || null,
        last_name: profile.last_name?.trim() || null,
        handicap_index: profile.handicap_index,
        preferred_price_range: profile.preferred_price_range,
        preferred_difficulty: profile.preferred_difficulty?.toLowerCase() || null,
        skill_level: profile.skill_level?.toLowerCase() || null,
        play_frequency: profile.play_frequency?.toLowerCase() || null,
        preferred_tees: profile.preferred_tees,
        number_of_holes: profile.number_of_holes,
        club_membership: profile.club_membership,
        driving_range: profile.driving_range,
        putting_green: profile.putting_green,
        chipping_green: profile.chipping_green,
        practice_bunker: profile.practice_bunker,
        restaurant: profile.restaurant,
        lodging_on_site: profile.lodging_on_site,
        motor_cart: profile.motor_cart,
        pull_cart: profile.pull_cart,
        golf_clubs_rental: profile.golf_clubs_rental,
        club_fitting: profile.club_fitting,
        golf_lessons: profile.golf_lessons,
      };

      const response = await fetch(
        `${config.API_URL}/api/profiles/current`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(dataToSave)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save profile');
      }

      setSuccess('Profile saved successfully!');
      await fetchProfile(); // Refresh data
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setProfile(prev => ({ ...prev, [name]: value }));
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
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 3, 
            color: 'text.secondary',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%'
          }}
        >
          Email: {profile.email}
        </Typography>

        <form onSubmit={handleSave}>
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            name="first_name"
            value={profile.first_name || ''}
            onChange={handleTextChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            name="last_name"
            value={profile.last_name || ''}
            onChange={handleTextChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Handicap Index"
            name="handicap_index"
            type="number"
            value={profile.handicap_index || ''}
            onChange={handleTextChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Preferred Price Range</InputLabel>
            <Select
              name="preferred_price_range"
              value={profile.preferred_price_range || ''}
              onChange={handleSelectChange}
              label="Preferred Price Range"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="$">$</MenuItem>
              <MenuItem value="$$">$$</MenuItem>
              <MenuItem value="$$$">$$$</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Preferred Difficulty</InputLabel>
            <Select
              name="preferred_difficulty"
              value={profile.preferred_difficulty || ''}
              onChange={handleSelectChange}
              label="Preferred Difficulty"
            >
              <MenuItem value="">Select...</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Skill Level</InputLabel>
            <Select
              name="skill_level"
              value={profile.skill_level || ''}
              onChange={handleSelectChange}
              label="Skill Level"
            >
              <MenuItem value="">Select...</MenuItem>
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Play Frequency</InputLabel>
            <Select
              name="play_frequency"
              value={profile.play_frequency || ''}
              onChange={handleSelectChange}
              label="Play Frequency"
            >
              <MenuItem value="">Select...</MenuItem>
              <MenuItem value="rarely">Rarely</MenuItem>
              <MenuItem value="sometimes">Sometimes</MenuItem>
              <MenuItem value="often">Often</MenuItem>
              <MenuItem value="very_often">Very Often</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Save Profile'
            )}
          </Button>
        </form>

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
      </Box>
    </PageLayout>
  );
};

export default GolferProfile;
