import React, { useState, useEffect, forwardRef } from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RecommendIcon from '@mui/icons-material/Recommend';
import StorageIcon from '@mui/icons-material/Storage';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import StatisticBox from '../../components/StatisticBox';

const LandingPage = forwardRef<HTMLDivElement>((props, ref) => {
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
    { number: '14,680', label: 'Golf Clubs', color: 'transparent' },
    { number: '18,091', label: 'Golf Courses', color: 'transparent' },
    { number: '84,861', label: 'Tees', color: 'transparent' },
    { number: '108', label: 'Data Points per Club', color: 'transparent' }
  ];

  return (
    <Container ref={ref} maxWidth="xl" sx={{ minHeight: '100vh', p: 0 }}>
      <Box
        sx={{
          position: 'relative',
          height: { xs: '60vh', md: '80vh' },
          width: '100%',
          backgroundImage: 'url(/golfclubheader.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          paddingTop: { xs: '20%', md: '15%' },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, color: 'white', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, 
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Your Personalized Golf Experience
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4,
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Discover and manage golf courses tailored to your preferences
            </Typography>
            <Box display={{ xs: 'flex', sm: 'column' }} gap={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/create-account')}
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: theme.palette.success.main,
                  '&:hover': {
                    bgcolor: theme.palette.success.dark,
                  }
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  px: 4,
                  py: 1.5,
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, color: 'black', mb: 6 }}>
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
                  <StatisticBox 
                    number={stat.number} 
                    label={stat.label} 
                    color="transparent"
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box 
        sx={{ 
          py: 1,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '48px',
          gap: 1
        }}
      >
        <Typography 
          variant="body2"
          sx={{ 
            m: 0,
            fontWeight: 500,
            textAlign: 'center'
          }}
        >
          Ready to find your perfect round?
        </Typography>
        <Button
          variant="contained"
          size="medium"
          onClick={() => navigate('/create-account')}
          sx={{
            bgcolor: 'white',
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: 'grey.100'
            }
          }}
        >
          Get Started Now
        </Button>
      </Box>
    </Container>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
