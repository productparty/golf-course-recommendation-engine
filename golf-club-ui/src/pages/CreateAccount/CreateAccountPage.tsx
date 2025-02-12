import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'  // Use shared client
import { config } from '../../config';

const CreateAccountPage = () => { // Renamed component
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const validateInputs = (email: string, password: string) => {
    const errors: { email: string; password: string } = { email: '', password: '' };
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      errors.email = 'Invalid email format.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }
    return errors;
  };

  const handleBlur = (field: string) => {
    const errors = validateInputs(email, password);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [field]: errors[field as keyof typeof errors] || '',
    }));
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const errors = validateInputs(email, password);
    if (errors.email || errors.password) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: import.meta.env.VITE_APP_URL || 'https://golf-club-ui-lac.vercel.app'
        }
      })

      if (error) throw error

      // Profile will be created automatically when they first access /golfer-profile
      navigate('/create-account-submitted')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Create Account
      </Typography>
      <Box component="form" onSubmit={handleSignUp} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
          error={!!fieldErrors.email}
          helperText={fieldErrors.email}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Loading...' : 'Sign Up'}
        </Button>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            <span dangerouslySetInnerHTML={{ __html: error }} />
          </Typography>
        )}
        {success && <Alert severity="success" sx={{ mt: 2 }}>Account created successfully! Redirecting to login...</Alert>}
      </Box>
    </Container>
  );
};

export default CreateAccountPage; // Updated export 