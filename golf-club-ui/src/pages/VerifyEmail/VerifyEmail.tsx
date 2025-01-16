import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      setLoading(true);
      setError('');
      setSuccess(false);

      const token = searchParams.get('token');
      if (!token) {
        setError('Invalid or missing token.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/verify-email?token=${token}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to verify email');
        }

        setSuccess(true);
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

    verifyEmail();
  }, [searchParams]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Verify Email
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : success ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Email verified successfully! You can now log in.
        </Alert>
      ) : null}
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/login')}>
        Go to Login
      </Button>
    </Container>
  );
};

export default VerifyEmail;
