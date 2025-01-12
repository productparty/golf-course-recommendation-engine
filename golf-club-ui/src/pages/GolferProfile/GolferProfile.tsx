import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface GolferProfile {
  email: string;
  first_name: string;
  last_name: string;
  handicap_index: number;
  preferred_price_range: string;
  preferred_difficulty: string;
  preferred_tees: string;
  skill_level: string;
  play_frequency: string;
}

const GolferProfile = () => {
  const [profile, setProfile] = useState<GolferProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        try {
          const { data, error } = await supabase
            .from('golfer_profile')
            .select('*')
            .eq('golfer_id', user.id)
            .single();

          if (error) throw error;

          setProfile(data);
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('An unexpected error occurred.');
          }
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

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
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Golfer Profile
      </Typography>
      {profile && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1"><strong>Email:</strong> {profile.email}</Typography>
          <Typography variant="body1"><strong>First Name:</strong> {profile.first_name}</Typography>
          <Typography variant="body1"><strong>Last Name:</strong> {profile.last_name}</Typography>
          <Typography variant="body1"><strong>Handicap Index:</strong> {profile.handicap_index}</Typography>
          <Typography variant="body1"><strong>Preferred Price Range:</strong> {profile.preferred_price_range}</Typography>
          <Typography variant="body1"><strong>Preferred Difficulty:</strong> {profile.preferred_difficulty}</Typography>
          <Typography variant="body1"><strong>Preferred Tees:</strong> {profile.preferred_tees}</Typography>
          <Typography variant="body1"><strong>Skill Level:</strong> {profile.skill_level}</Typography>
          <Typography variant="body1"><strong>Play Frequency:</strong> {profile.play_frequency}</Typography>
        </Box>
      )}
    </Container>
  );
};

export default GolferProfile;
