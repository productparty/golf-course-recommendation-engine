import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, TextField, Button, MenuItem, Select, InputLabel, FormControl, Autocomplete, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';

interface GolferProfile {
  email: string;
  first_name: string;
  last_name: string;
  handicap_index: number;
  preferred_price_range: string;
  preferred_difficulty: string;
  preferred_tees: string;  // Include preferred_tees in the profile interface
  skill_level: string;
  play_frequency: string;
  club_id: string | null;
  club_name: string | null;  // Include club_name in the profile interface
}

interface GolfClub {
  club_id: string;
  club_name: string;
}

const GolferProfile = () => {
  const [profile, setProfile] = useState<GolferProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [clubs, setClubs] = useState<GolfClub[]>([]);
  const [selectedClub, setSelectedClub] = useState<GolfClub | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('In order to view your profile, you must log in first:');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/get-golfer-profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
        if (data.club_id) {
          setSelectedClub({ club_id: data.club_id, club_name: data.club_name });
        }
      } catch (error) {
        setError('In order to view your profile, you must log in first.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchInitialClubs = async () => {
      try {
        const response = await axios.get<GolfClub[]>('http://localhost:8000/search-golf-clubs', {
          params: { query: '' },
        });
        setClubs(response.data);
      } catch (error) {
        console.error('Error fetching initial clubs:', error);
      }
    };

    fetchInitialClubs();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    try {
      const response = await fetch('http://localhost:8000/update-golfer-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ ...profile, club_id: selectedClub?.club_id || null }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setEditMode(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const fetchClubs = async (query: string) => {
    try {
      const response = await axios.get<GolfClub[]>('http://localhost:8000/search-golf-clubs', {
        params: { query },
      });
      setClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const debouncedFetchClubs = useCallback(debounce(fetchClubs, 300), []);

  const handleClubSearch = (event: React.ChangeEvent<{}>, value: string) => {
    debouncedFetchClubs(value);
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Typography color="error" sx={{ mt: 2 }}>
          {error} <Link href="/login">Log in</Link>
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Golfer Profile
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, textAlign: 'left' }}>
        Please update your profile with information about you and your game.
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>
          Edit
        </Button>
      </Box>
      {profile && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            value={profile.email || ''}
            margin="normal"
            sx={{ backgroundColor: 'white' }}
            disabled
          />
          <TextField
            fullWidth
            label="First Name"
            value={profile.first_name || ''}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            margin="normal"
            sx={{ backgroundColor: 'white' }}
            disabled={!editMode}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={profile.last_name || ''}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            margin="normal"
            sx={{ backgroundColor: 'white' }}
            disabled={!editMode}
          />
          <TextField
            fullWidth
            label="Handicap Index"
            type="number"
            value={profile.handicap_index || 0}
            onChange={(e) => setProfile({ ...profile, handicap_index: parseFloat(e.target.value) })}
            inputProps={{ min: 0, max: 40.4, step: 0.1 }}
            margin="normal"
            sx={{ backgroundColor: 'white' }}
            disabled={!editMode}
          />
          <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
            <InputLabel>Preferred Price Range</InputLabel>
            <Select
              value={profile.preferred_price_range || ''}
              onChange={(e) => setProfile({ ...profile, preferred_price_range: e.target.value })}
              label="Preferred Price Range"
              disabled={!editMode}
            >
              <MenuItem value="$">$</MenuItem>
              <MenuItem value="$$">$$</MenuItem>
              <MenuItem value="$$$">$$$</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
            <InputLabel>Preferred Difficulty</InputLabel>
            <Select
              value={profile.preferred_difficulty || ''}
              onChange={(e) => setProfile({ ...profile, preferred_difficulty: e.target.value })}
              label="Preferred Difficulty"
              disabled={!editMode}
            >
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
            <InputLabel>Preferred Tees</InputLabel>
            <Select
              value={profile.preferred_tees || ''}
              onChange={(e) => setProfile({ ...profile, preferred_tees: e.target.value })}
              label="Preferred Tees"
              disabled={!editMode}
            >
              <MenuItem value="Black">Black</MenuItem>
              <MenuItem value="Blue">Blue</MenuItem>
              <MenuItem value="White">White</MenuItem>
              <MenuItem value="Gold">Gold</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
            <InputLabel>Skill Level</InputLabel>
            <Select
              value={profile.skill_level || ''}
              onChange={(e) => setProfile({ ...profile, skill_level: e.target.value })}
              label="Skill Level"
              disabled={!editMode}
            >
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
            <InputLabel>Play Frequency</InputLabel>
            <Select
              value={profile.play_frequency || ''}
              onChange={(e) => setProfile({ ...profile, play_frequency: e.target.value })}
              label="Play Frequency"
              disabled={!editMode}
            >
              <MenuItem value="Rarely">Rarely</MenuItem>
              <MenuItem value="Occasionally">Occasionally</MenuItem>
              <MenuItem value="Regularly">Regularly</MenuItem>
              <MenuItem value="Frequently">Frequently</MenuItem>
            </Select>
          </FormControl>
          <Autocomplete
            options={clubs}
            getOptionLabel={(option) => option.club_name}
            value={selectedClub || null}
            onChange={(event, newValue) => setSelectedClub(newValue)}
            onInputChange={handleClubSearch}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Favorite Golf Club"
                margin="normal"
                sx={{ backgroundColor: 'white' }}
                disabled={!editMode}
              />
            )}
          />
          {editMode && (
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSave}>
              Save
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
};

export default GolferProfile;
