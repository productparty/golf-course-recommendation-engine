import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert, Link } from '@mui/material';
import { config } from '../../config';
import PageLayout from '../../components/PageLayout';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  console.log('API URL:', config.API_URL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('handleSubmit - Start', { email, password }); // Log values

    try {
      await signIn(email, password);
      console.log('handleSubmit - signIn successful'); // Log after signIn
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
      console.log('handleSubmit - End'); // Log at the end
    }
  };

  return (
    <PageLayout title="Login">
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link href="/password-reset" color="primary">
              Need to reset your password?
            </Link>
          </Typography>
          <Typography variant="body2">
            <Link href="/create-account" color="primary">
              Need to create an account?
            </Link>
          </Typography>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default Login;
