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
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';
import { config } from '../../config';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface GolferProfile {
  golfer_id: string;
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
  is_verified: boolean;
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
  state: string | null;
  city: string | null;
  country: string | null;
}

const GolferProfile: React.FC = () => {
  const { session, signOut, getToken } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GolferProfile>({
    golfer_id: '',
    email: '',
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
    is_verified: false,
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
    state: null,
    city: null,
    country: null,
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession?.access_token) {
          setError('No valid session');
          setIsLoading(false);
          return;
        }

        const apiUrl = `${config.API_URL}/api/get-golfer-profile`;
        console.log('Making request with token:', currentSession.access_token.substring(0, 10));

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentSession.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Profile fetch failed:', errorData);
          throw new Error(errorData.detail?.error || 'Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch profile');
        setIsLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [session, signOut, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${config.API_URL}/api/update-golfer-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.status === 401) {
        setError('Session expired - please log in again');
        await signOut();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      const updatedData = await response.json();
      setProfile(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
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

        <form onSubmit={handleSubmit}>
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
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
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
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
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
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Rarely">Rarely</MenuItem>
              <MenuItem value="Sometimes">Sometimes</MenuItem>
              <MenuItem value="Often">Often</MenuItem>
              <MenuItem value="Very Often">Very Often</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Number of Holes</InputLabel>
            <Select
              name="number_of_holes"
              value={profile.number_of_holes || ''}
              onChange={handleSelectChange}
              label="Number of Holes"
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="9">9</MenuItem>
              <MenuItem value="18">18</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Club Membership</InputLabel>
            <Select
              name="club_membership"
              value={profile.club_membership || ''}
              onChange={handleSelectChange}
              label="Club Membership"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Public">Public</MenuItem>
              <MenuItem value="Private">Private</MenuItem>
              <MenuItem value="Military">Military</MenuItem>
              <MenuItem value="Municipal">Municipal</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Driving Range</InputLabel>
            <Select
              name="driving_range"
              value={profile.driving_range ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Driving Range"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Putting Green</InputLabel>
            <Select
              name="putting_green"
              value={profile.putting_green ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Putting Green"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Chipping Green</InputLabel>
            <Select
              name="chipping_green"
              value={profile.chipping_green ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Chipping Green"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Practice Bunker</InputLabel>
            <Select
              name="practice_bunker"
              value={profile.practice_bunker ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Practice Bunker"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Restaurant</InputLabel>
            <Select
              name="restaurant"
              value={profile.restaurant ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Restaurant"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Lodging On-Site</InputLabel>
            <Select
              name="lodging_on_site"
              value={profile.lodging_on_site ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Lodging On-Site"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Motor Cart Availability</InputLabel>
            <Select
              name="motor_cart"
              value={profile.motor_cart ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Motor Cart Availability"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Pull Cart Availability</InputLabel>
            <Select
              name="pull_cart"
              value={profile.pull_cart ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Pull Cart Availability"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Golf Club Rentals</InputLabel>
            <Select
              name="golf_clubs_rental"
              value={profile.golf_clubs_rental ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Golf Club Rentals"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Club Fitting</InputLabel>
            <Select
              name="club_fitting"
              value={profile.club_fitting ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Club Fitting"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Golf Lessons</InputLabel>
            <Select
              name="golf_lessons"
              value={profile.golf_lessons ? 'Yes' : 'No'}
              onChange={handleSelectChange}
              label="Golf Lessons"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="State"
            name="state"
            value={profile.state || ''}
            onChange={handleTextChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="City"
            name="city"
            value={profile.city || ''}
            onChange={handleTextChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Country"
            name="country"
            value={profile.country || ''}
            onChange={handleTextChange}
          />
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
