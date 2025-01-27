import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsLoaded(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: 'Find Clubs',
      description: 'Search and filter golf clubs based on your preferences'
    },
    {
      icon: <RecommendIcon sx={{ fontSize: 40 }} />,
      title: 'Get Recommendations',
      description: 'Receive personalized club recommendations'
    },
    {
      icon: <StorageIcon sx={{ fontSize: 40 }} />,
      title: 'Access Data',
      description: 'View comprehensive club information'
    },
    {
      icon: <AddLocationIcon sx={{ fontSize: 40 }} />,
      title: 'Track Favorites',
      description: 'Save and manage your favorite clubs'
    }
  ];

  const statistics = [
    { number: '14,680', label: 'Golf Clubs', color: '#FF9800' },
    { number: '18,091', label: 'Golf Courses', color: '#2E7D32' },
    { number: '84,861', label: 'Tees', color: '#9C27B0' },
    { number: '108', label: 'Data Points per Club', color: '#AB4000' }
  ];

  return (
    <Container maxWidth="xl" sx={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <Box component="nav" sx={{ py: 2, position: 'sticky', top: 0, bgcolor: 'white', zIndex: 10, boxShadow: 1 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              GolfDB
            </Typography>
          </Grid>
          <Grid item>
            <Box display="flex" gap={2}>
              <Button variant="text" onClick={() => navigate('/about')}>About</Button>
              <Button variant="text" onClick={() => navigate('/contact')}>Contact</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' }, mb: 4 }}>
            Find Your Perfect Golf Experience
          </Typography>
          <Typography variant="h5" sx={{ mb: 6, color: 'text.secondary' }}>
            Your one-stop destination for discovering and managing golf courses across the U.S.
          </Typography>
          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/create-account')}
              sx={{ px: 4, py: 1.5 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ px: 4, py: 1.5 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" gutterBottom>
            Features
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ my: 2 }}>{feature.title}</Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" gutterBottom>
            Unmatched Database
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {statistics.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StatisticBox {...stat} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Ready to find your perfect round?
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/create-account')}
            sx={{
              mt: 3,
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Container>
  );
};

export default LandingPage; 