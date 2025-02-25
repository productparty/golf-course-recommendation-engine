import React, { useState, useEffect, forwardRef } from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent, CardMedia, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RecommendIcon from '@mui/icons-material/Recommend';
import StorageIcon from '@mui/icons-material/Storage';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
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
    // Set loaded to true after a delay even if no scroll
    const timer = setTimeout(() => setIsLoaded(true), 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const features = [
    {
      title: "Find Your Perfect Course",
      description: "Search through thousands of golf courses filtered by location, price, and amenities to find the perfect match for your game.",
      icon: <SearchIcon fontSize="large" color="primary" />,
      image: "https://images.unsplash.com/photo-1535132011086-b8818f016104?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      title: "Personalized Recommendations",
      description: "Get course recommendations based on your skill level, preferences, and playing style.",
      icon: <RecommendIcon fontSize="large" color="primary" />,
      image: "https://images.unsplash.com/photo-1592919505780-303950717480?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      title: "Save Your Favorites",
      description: "Keep track of courses you love and want to play again with our favorites feature.",
      icon: <StarIcon fontSize="large" color="primary" />,
      image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    }
  ];

  const statistics = [
    { number: '10,000+', label: 'Golf Courses' },
    { number: '50+', label: 'Course Features' },
    { number: '100%', label: 'Free to Use' },
    { number: '24/7', label: 'Available' }
  ];

  const testimonials = [
    {
      quote: "This app helped me find the perfect course for my skill level. I've improved my game significantly by playing courses that match my abilities.",
      author: "Michael T., 12 Handicap"
    },
    {
      quote: "I travel for work and always want to find great courses wherever I go. This app makes it so easy to find hidden gems in every city.",
      author: "Sarah L., 8 Handicap"
    },
    {
      quote: "As a beginner, I was intimidated by many courses. The recommendations feature helped me find beginner-friendly courses that made golf enjoyable.",
      author: "James R., 22 Handicap"
    }
  ];

  const benefits = [
    "Find courses that match your skill level",
    "Discover new courses with specific amenities",
    "Save time researching course options",
    "Track your favorite courses in one place",
    "Get personalized recommendations",
    "Connect with a community of golfers"
  ];

  return (
    <Container maxWidth={false} disableGutters sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: { xs: 10, md: 15 },
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh'
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Find Your Perfect Golf Experience
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 300 }}>
              Discover and compare thousands of golf courses tailored to your preferences
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
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
                sx={{ px: 4, py: 1.5, color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Login
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" gutterBottom sx={{ 
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, 
            color: 'black', 
            mb: 6 
          }}>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    boxShadow: 3
                  }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={feature.image}
                      alt={feature.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: '100%' 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {feature.icon}
                        <Typography variant="h5" component="h2" sx={{ ml: 1 }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
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

      {/* Benefits Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h3" gutterBottom sx={{ 
                  fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, 
                  color: 'black'
                }}>
                  Why Choose Our Platform?
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  Our comprehensive golf course database and intelligent recommendation system help you find the perfect course every time.
                </Typography>
                <List>
                  {benefits.map((benefit, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={benefit} />
                    </ListItem>
                  ))}
                </List>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
                  alt="Golfer on course"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: 4
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.800', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" gutterBottom sx={{ 
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, 
            mb: 6 
          }}>
            What Golfers Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    boxShadow: 3 
                  }}>
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <PersonIcon fontSize="large" />
                      </Box>
                      <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
                        "{testimonial.quote}"
                      </Typography>
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
                      <Typography variant="subtitle1" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                        {testimonial.author}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Container>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
