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
import { supabase } from '../../context/AuthContext';

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
    is_verified: false
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setError('No authentication token available');
          setIsLoading(false);
          return;
        }

        const apiUrl = `${config.API_URL}/api/get-golfer-profile`;
        console.log('Making request to:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Origin': import.meta.env.VITE_APP_URL
          }
        });

        if (response.status === 401) {
          if (refreshAttempts >= 2) {
            console.log('Too many refresh attempts, logging out');
            setError('Session expired - please log in again');
            await signOut();
            navigate('/login');
            return;
          }

          console.log('Unauthorized - attempting refresh');
          setRefreshAttempts(prev => prev + 1);
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || `Server error: ${response.status}`);
        }

        setProfile(data);
        setError('');
        setRefreshAttempts(0);
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
  }, [session, signOut, navigate, refreshAttempts, getToken]);

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
          sx={{ mb: 3, color: 'text.secondary' }}
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
