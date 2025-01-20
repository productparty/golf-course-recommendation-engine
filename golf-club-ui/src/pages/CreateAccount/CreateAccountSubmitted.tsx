import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreateAccountSubmitted: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Verify Your Email
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          Please check your email for a verification link from Supabase.
          You won't be able to log in until you verify your email address.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate('/golf-club-ui/login')}
        >
          Go to Login
        </Button>
      </Box>
    </Container>
  );
};

export default CreateAccountSubmitted;
