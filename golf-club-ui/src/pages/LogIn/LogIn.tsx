import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient'  // Use shared client

const LogIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

  useEffect(() => {
    console.log('API URL:', apiUrl);
    if (session) {
      navigate('/');
    }
  }, [session, navigate, apiUrl]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });

      if (error) throw error;

      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Log In
      </Typography>
      <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <Box sx={{ mt: 2 }}>
          <RouterLink to="/create-account" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" color="primary">
              Need to create an account?
            </Typography>
          </RouterLink>
        </Box>
        <Box sx={{ mt: 2 }}>
          <RouterLink to="/password-reset" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" color="primary">
              Need to reset your password?
            </Typography>
          </RouterLink>
        </Box>
      </Box>
    </Container>
  );
};

export default LogIn;

