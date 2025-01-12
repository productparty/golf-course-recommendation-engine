import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.session) {
        // Safe access to localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('supabase.auth.token', data.session.access_token);
        }
        navigate('/golfer-profile');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Log In
      </Typography>
      <Box component="form" onSubmit={handleLogIn} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Loading...' : 'Log In'}
        </Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </Box>
    </Container>
  );
};

export default LogIn;
