import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useRouteError, useNavigate } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={4}
    >
      <Typography variant="h5" color="error" gutterBottom>
        Oops! Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {error?.statusText || error?.message || "An unexpected error occurred"}
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => navigate('/')}
        sx={{ mt: 2, mr: 2 }}
      >
        Go to Home
      </Button>
      <Button 
        variant="outlined"
        onClick={() => window.location.reload()}
        sx={{ mt: 2 }}
      >
        Refresh Page
      </Button>
    </Box>
  );
};

export default ErrorPage; 