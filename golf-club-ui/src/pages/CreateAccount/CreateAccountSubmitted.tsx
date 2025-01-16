import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreateAccountSubmitted: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Account Created
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          Your account has been created successfully! Please check your email to confirm your account before moving forward.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => navigate('/find-my-club')}
        >
          Find My Club
        </Button>
      </Box>
    </Container>
  );
};

export default CreateAccountSubmitted;
