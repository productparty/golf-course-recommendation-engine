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
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  handicap_index: number | null;
  preferred_price_range: string | null;
  preferred_difficulty: string | null;
  skill_level: string | null;
  play_frequency: string | null;
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
        id: session.user.id,
        email: profile.email,
        first_name: profile.first_name?.trim() || null,
        last_name: profile.last_name?.trim() || null,
        handicap_index: profile.handicap_index,
        preferred_price_range: profile.preferred_price_range,
        preferred_difficulty: profile.preferred_difficulty,
        skill_level: profile.skill_level,
        play_frequency: profile.play_frequency
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(dataToSave, {
          onConflict: 'id'
        });

      if (error) throw error;

      setSuccess('Profile saved successfully!');
      await fetchProfile(); // Refresh data
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(
        error.message === 'No user session found'
          ? 'Please log in to save your profile'
          : 'Failed to save profile. Please try again.'
      );
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
