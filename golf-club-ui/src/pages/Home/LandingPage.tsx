import { Container, Typography, Box, Button, Grid, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../../styles/commonStyles';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RecommendIcon from '@mui/icons-material/Recommend';
import StorageIcon from '@mui/icons-material/Storage';
import AddLocationIcon from '@mui/icons-material/AddLocation';

const Screenshot = ({ src, title, description, align = 'left' }: any) => (
  <motion.div
    initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: align === 'left' ? 'row' : 'row-reverse' },
      alignItems: 'center',
      gap: 4,
      mb: 8 
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom color="primary">
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {description}
        </Typography>
      </Box>
      <Box sx={{ 
        flex: 1,
        '& img': {
          width: '100%',
          borderRadius: 2,
          boxShadow: 3,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
          }
        }
      }}>
        <img src={src} alt={title} />
      </Box>
    </Box>
  </motion.div>
);

const StatisticBox = ({ number, label }: { number: string; label: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 'bold',
          color: 'primary.main',
          mb: 1 
        }}
      >
        {number}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const styles = commonStyles(theme);

  return (
    <Container maxWidth="lg">
      {/* Hero Section with Parallax Effect */}
      <Box sx={{ 
        textAlign: 'center', 
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundImage: 'url("/golfclubheader.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        borderRadius: 2,
        mb: 6,
        color: 'white',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          borderRadius: 2,
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
          }}>
            Find My Club
          </Typography>
          <Typography variant="h5" sx={{ 
            mb: 4,
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            px: { xs: 2, sm: 0 }
          }}>
            Personalized golf club recommendations for golfers of every level.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/create-account')}
              sx={{ 
                mr: 2,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
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
                fontSize: '1.1rem',
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Database Statistics Section */}
      <Box sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          px: { xs: 2, sm: 0 }
        }}>
          Unmatched Database
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}>
          Our comprehensive database covers clubs and courses across the U.S., offering 
          in-depth details about facilities, services, pricing, and more.
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 8 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticBox number="14,680" label="Golf Clubs" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticBox number="18,091" label="Golf Courses" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticBox number="84,861" label="Tees" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticBox number="108" label="Data Points per Club" />
          </Grid>
        </Grid>
      </Box>

      {/* Combined Database Content & Screenshots Section */}
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" gutterBottom textAlign="center" sx={{ mb: 6 }}>
          What's Inside?
        </Typography>

        <Screenshot
          src="/find-club.jpeg"
          title="Advanced Search & Filtering"
          description={
            <Box component="div">
              <Typography variant="body1" sx={{ mb: 2 }}>
                Find your perfect match with detailed filtering options:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography component="ul" sx={{ pl: 2 }}>
                    <li>Location & Contact Details</li>
                    <li>Available Amenities</li>
                    <li>Facility Types</li>
                    <li>Operating Hours</li>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography component="ul" sx={{ pl: 2 }}>
                    <li>Membership Options</li>
                    <li>Pricing Structure</li>
                    <li>Course Difficulty</li>
                    <li>Course Conditions</li>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          }
        />
        
        <Screenshot
          src="/recommendations.jpg"
          title="Comprehensive Course Data"
          description={
            <Box component="div">
              <Typography variant="body1" sx={{ mb: 2 }}>
                Access detailed course information tailored to your needs:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography component="ul" sx={{ pl: 2 }}>
                    <li>Course Par & Layout</li>
                    <li>Architect Details</li>
                    <li>Course Rating</li>
                    <li>Slope Rating</li>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography component="ul" sx={{ pl: 2 }}>
                    <li>Tee Distances</li>
                    <li>Handicap Information</li>
                    <li>Hole-by-Hole Data</li>
                    <li>Practice Facilities</li>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          }
          align="right"
        />
        
        <Screenshot
          src="/submit-club.jpg"
          title="Easy Club Management"
          description={
            <Box component="div">
              <Typography variant="body1" sx={{ mb: 2 }}>
                Club operators can easily manage their facility information:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography component="ul" sx={{ pl: 2 }}>
                    <li>Facility Details</li>
                    <li>Service Offerings</li>
                    <li>Pricing Updates</li>
                    <li>Course Changes</li>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography component="ul" sx={{ pl: 2 }}>
                    <li>Special Events</li>
                    <li>Amenity Updates</li>
                    <li>Contact Information</li>
                    <li>Operating Hours</li>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          }
        />
      </Box>

      {/* Final Call to Action */}
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        backgroundColor: '#2E5A27',
        color: 'white',
        borderRadius: 2,
        mb: 6 
      }}>
        <Typography variant="h4" gutterBottom>
          Ready to find your perfect golf club?
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/create-account')}
          sx={{ 
            mt: 3,
            backgroundColor: 'white',
            color: '#2E5A27',
            '&:hover': {
              backgroundColor: 'grey.100',
            }
          }}
        >
          Get Started Now
        </Button>
      </Box>
    </Container>
  );
};

export default LandingPage; 