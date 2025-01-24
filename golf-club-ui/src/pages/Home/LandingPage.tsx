import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../../styles/commonStyles';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

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
          <Typography variant="h2" component="h1" gutterBottom>
            Find My Club
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Your Personalized Golf Club Search
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
              Log In
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{
            p: 4,
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-8px)',
            }
          }}>
            <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 500 }}>
              Find Clubs
            </Typography>
            <Typography>
              Discover golf clubs that match your preferences with our advanced search filters. 
              Filter by location, amenities, and more.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{
            p: 4,
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-8px)',
            }
          }}>
            <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 500 }}>
              Recommended Clubs
            </Typography>
            <Typography>
              Get personalized club recommendations based on your skill level, preferences, 
              and playing style.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{
            p: 4,
            height: '100%',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-8px)',
            }
          }}>
            <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 500 }}>
              Submit Club
            </Typography>
            <Typography>
              Are you a club operator? Add your facility to our database and reach more golfers.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Screenshots Section */}
      <Box sx={{ py: 8 }}>
        <Screenshot
          src="/find-club.jpeg"
          title="Find the Perfect Club"
          description="Use our advanced search filters to find golf clubs that match your exact needs. Filter by location, amenities, price range, and more."
        />
        
        <Screenshot
          src="/recommendations.jpg"
          title="Personalized Recommendations"
          description="Get club recommendations tailored to your skill level and preferences."
          align="right"
        />
        
        <Screenshot
          src="/submit-club.jpg"
          title="Easy Club Submission"
          description="Club operators can easily add their facilities to our growing database."
        />
      </Box>

      {/* Final Call to Action */}
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        backgroundColor: 'primary.main',
        color: 'white',
        borderRadius: 2,
        mb: 6 
      }}>
        <Typography variant="h4" gutterBottom>
          Ready to find your perfect golf course?
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/create-account')}
          sx={{ 
            mt: 3,
            backgroundColor: 'white',
            color: 'primary.main',
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