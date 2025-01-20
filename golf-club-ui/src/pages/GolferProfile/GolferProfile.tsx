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
  SelectChangeEvent 
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/api';
import PageLayout from '../../components/PageLayout';

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
  const { session } = useAuth();
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!session?.access_token) return;

        const response = await fetch(`${API_BASE_URL}/get-golfer-profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/update-golfer-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
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
        <Typography>Loading profile...</Typography>
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
          >
            Save Profile
          </Button>
        </form>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </PageLayout>
  );
};

export default GolferProfile;
