import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      {/* Hero Section - Updated */}
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        backgroundImage: 'url("/golfclubheadertext.jpg")', // Updated image name
        backgroundSize: 'contain',  // Changed from 'cover'
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: 2,
        mb: 6,
        minHeight: '200px',  // Add minimum height
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Remove these Typography components since they're in the image
        <Typography variant="h2" component="h1" gutterBottom>
          Find My Club
        </Typography>
        <Typography variant="h5" sx={{ mb: 4 }}>
          Personalized Golf Club Search
        </Typography>
        */}
      </Box>

      {/* Auth Buttons Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 6,
        display: 'flex',
        gap: 2,
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/create-account')}
        >
          Create Account
        </Button>
        <Button 
          variant="outlined" 
          color="primary"
          size="large"
          onClick={() => navigate('/login')}
        >
          Log In
        </Button>
      </Box>

      {/* Problem Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom color="primary">
          Problem
        </Typography>
        <Typography variant="body1" paragraph>
          Golfers face significant challenges in finding courses that match their skill level, 
          preferences, and schedules. Course operators struggle to effectively promote their 
          facilities, leading to inefficiencies and lost opportunities.
        </Typography>
      </Paper>

      {/* Solution Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom color="primary">
          Our Solution
        </Typography>
        <Typography variant="body1" paragraph>
          Find My Club is a one-stop platform tailored for golfers,offering personalized course 
          recommendations, advanced search capabilities, and an easy-to-use course submission tool.
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Find Clubs
            </Typography>
            <Typography>
              Find the perfect course using our detailed search filters including price, difficulty, and amenities.
            </Typography>
          </Paper>
        </Grid><Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Recommended Clubs
            </Typography>
            <Typography>
              Get course recommendations based on your skill level, preferences, and playing history.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Submit Club
            </Typography>
            <Typography>
              Course operators can easily submit and manage their facility information.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Final Call to Action */}
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h5" gutterBottom>
          Ready to find your perfect golf course?
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/create-account')}
          sx={{ mt: 2 }}
        >
          Get Started Now
        </Button>
      </Box>
    </Container>
  );
};

export default LandingPage; 