import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreateAccount = () => {
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
      // Register user
      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to register user');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to register user');
        }
      }

      setSuccess(true);
      navigate('/create-account-submitted');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error('Error details:', error); // Log detailed error
    } finally {
      setLoading(false);
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

export default CreateAccount;
