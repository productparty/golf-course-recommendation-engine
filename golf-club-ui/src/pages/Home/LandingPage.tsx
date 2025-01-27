import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../../styles/commonStyles';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RecommendIcon from '@mui/icons-material/Recommend';
import StorageIcon from '@mui/icons-material/Storage';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import StatisticBox from '../../components/StatisticBox';
import Screenshot from '../../components/Screenshots';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const styles = commonStyles(theme);

  // Add state for animations
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle scroll animation
  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ minHeight: '100vh', px: { xs: 2, sm: 4, md: 8 } }}>
      {/* Navigation Bar */}
      <Box
        component="nav"
        sx={{
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Grid container justifyContent="space-between" alignItems="center" py={2}>
          <Grid item>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>GolfDB</Typography>
          </Grid>
          <Grid item>
            <Box display="flex" gap={2}>
              <Button
                variant="text"
                onClick={() => navigate('/about')}
                aria-label="About GolfDB"
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                  },
                }}
              >
                About
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/contact')}
                aria-label="Contact GolfDB"
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                  },
                }}
              >
                Contact
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          my: 12,
          textAlign: 'center',
          pb: 8,
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 2,
            backgroundColor: 'primary.main',
            transform: 'translateY(-50%)',
            opacity: 0.3,
          },
        }}
      >
        <Box>
          <Typography
            variant="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
              fontWeight: 'bold',
              mb: 4,
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(-20px)',
            }}
          >
            Find Your Perfect Golf Experience
          </Typography>
          
          <Box sx={{ opacity: isLoaded ? 1 : 0, transition: '.5s ease' }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '2rem', sm: '3rem' },
                mb: 8,
                fontWeight: 'medium',
              }}
            >
              Your one-stop destination for discovering and managing golf courses across the U.S.
            </Typography>

            <Box
              component="div"
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/create-account')}
                sx={{
                  px: 6,
                  py: 3,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#45a049',
                  },
                  transition: 'all .3s ease',
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  px: 6,
                  py: 3,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                  '&:hover': {
                    backgroundColor: 'rgba(76,175,80,0.1)',
                  },
                  transition: 'all .3s ease',
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Database Statistics Section */}
      <Box
        sx={{
          py: 12,
          textAlign: 'center',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(-20px)',
        }}
      >
        <Typography variant="h3" gutterBottom>
          Unmatched Database
        </Typography>
        
        <Box
          sx={{
            maxWidth: { xs: 600, sm: 800 },
            mx: 'auto',
            my: 4,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ mb: 8, color: 'secondary.main' }}
          >
            Our comprehensive database covers clubs and courses across the U.S., offering in-depth details about facilities, services, pricing, and more.
          </Typography>

          <Grid container spacing={4}>
            {[{
              number: '14,680',
              label: 'Golf Clubs',
              color: '#FF9800',
            },
            {
              number: '18,091',
              label: 'Golf Courses',
              color: '#2E7D32',
            },
            {
              number: '84,861',
              label: 'Tees',
              color: '#9C27B0',
            },
            {
              number: '108',
              label: 'Data Points per Club',
              color: '#AB4000',
            }].map((stat) => (
              <Grid key={stat.label} item xs={12} sm={6} md={3}>
                <StatisticBox
                  number={stat.number}
                  label={stat.label}
                  color={stat.color}
                />
              </Grid>
            ))}

          </Grid>
        </Box>
      </Box>

      {/* Combined Database Content & Screenshots Section */}
      <Box sx={{ py: 12 }}>
        <Typography variant="h3" gutterBottom textAlign="center">
          What's Inside?
        </Typography>

        <Box
          component="div"
          sx={{
            overflowX: 'hidden',
            mb: 8,
          }}
        >
          {[{
            src: '/find-club.jpeg',
            title: 'Advanced Search & Filtering',
            description: (
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold">Location & Contact Details</Typography>
                  <ul style={{ paddingLeft: '16px', marginBottom: '16px' }}>
                    <li>Address and Directions</li>
                    <li>Phone Numbers</li>
                    <li>Operating Hours</li>
                    <li>Website Links</li>
                  </ul>

                  <Typography variant="h6" fontWeight="bold">Available Amenities</Typography>
                  <ul style={{ paddingLeft: '16px' }}>
                    <li>Practice Facilities</li>
                    <li>Pro Shop</li>
                    <li>Restaurant/Bar</li>
                    <li>Locker Rooms</li>
                  </ul>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold">Membership Options</Typography>
                  <ul style={{ paddingLeft: '16px', marginBottom: '16px' }}>
                    <li>Public/Private Status</li>
                    <li>Membership Types</li>
                    <li>Guest Policies</li>
                    <li>Special Programs</li>
                  </ul>

                  <Typography variant="h6" fontWeight="bold">Course Details</Typography>
                  <ul style={{ paddingLeft: '16px' }}>
                    <li>Difficulty Levels</li>
                    <li>Course Conditions</li>
                    <li>Price Ranges</li>
                    <li>Peak Hours</li>
                  </ul>
                </Grid>
              </Grid>
            ),
          },
          {
            src: '/recommendations.jpg',
            title: 'Comprehensive Course Data',
            description: (
              <Box component="div">
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="bold">Course Par & Layout</Typography>
                    <ul style={{ paddingLeft: '16px', marginBottom: '16px' }}>
                      <li>Total Par</li>
                      <li>Course Length</li>
                      <li>Hole Details</li>
                      <li>Course Maps</li>
                    </ul>

                    <Typography variant="h6" fontWeight="bold">Course Ratings</Typography>
                    <ul style={{ paddingLeft: '16px' }}>
                      <li>USGA Rating</li>
                      <li>Slope Rating</li>
                      <li>Difficulty Index</li>
                      <li>Player Reviews</li>
                    </ul>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="bold">Tee Information</Typography>
                    <ul style={{ paddingLeft: '16px', marginBottom: '16px' }}>
                      <li>Multiple Tee Options</li>
                      <li>Distance Per Hole</li>
                      <li>Handicap Information</li>
                      <li>Recommended Skill Level</li>
                    </ul>

                    <Typography variant="h6" fontWeight="bold">Practice Facilities</Typography>
                    <ul style={{ paddingLeft: '16px' }}>
                      <li>Driving Range</li>
                      <li>Putting Green</li>
                      <li>Chipping Area</li>
                      <li>Practice Bunkers</li>
                    </ul>
                  </Grid>
                </Grid>
              </Box>
            ),
          },
          {
            src: '/submit-club.jpg',
            title: 'Easy Club Management',
            description: (
              <Box component="div">
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <ul style={{ paddingLeft: '16px' }}>
                      <li>Facility Details</li>
                      <li>Service Offerings</li>
                      <li>Pricing Updates</li>
                      <li>Course Changes</li>
                    </ul>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <ul style={{ paddingLeft: '16px' }}>
                      <li>Special Events</li>
                      <li>Amenity Updates</li>
                      <li>Contact Information</li>
                      <li>Operating Hours</li>
                    </ul>
                  </Grid>
                </Grid>
              </Box>
            ),
          }].map((item, index) => (
            <Screenshot
              key={index}
              src={item.src}
              title={item.title}
              description={item.description}
              align={index === 0 ? 'left' : 'right'}
            />
          ))}

        </Box>

        <Box
          component="div"
          sx={{
            mb: 8,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Ready to find your perfect round?
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/create-account')}
            sx={{
              mt: 3,
              px: { xs: 4, sm: 6 },
              py: 2.5,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              backgroundColor: '#4CAF50',
              color: 'white',
              '&:hover': {
                backgroundColor: '#45a049',
              },
              transition: 'all .3s ease',
            }}
          >
            Get Started Now
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LandingPage; 