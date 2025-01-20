import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const CreateAccountSuccessful = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFirstLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate('/home');  // Update this to match your existing route
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Thank you for confirming your email!
        </Alert>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Find My Club!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please log in to get started with finding your perfect golf club.
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleFirstLogin} sx={{ mt: 2 }}>
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
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth
          sx={{ mt: 3, mb: 2 }} 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link href="/password-reset" variant="body2">
            Forgot your password?
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateAccountSuccessful;
