import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const CreateAccountSubmitted: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Check Your Email
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            We've sent you a confirmation email. Please check your inbox and click the verification link to complete your registration.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            If you don't see the email, please check your spam folder.
          </Typography>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="primary"
          >
            Return to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateAccountSubmitted;
