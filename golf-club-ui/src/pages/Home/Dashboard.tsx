import React from 'react';
import { 
  Container, Typography, Box, Grid, Paper, Button,
  Card, CardContent, CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RecommendIcon from '@mui/icons-material/Recommend';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick: () => void;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, buttonText, onClick, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s',
      minHeight: '300px',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: 6,
      }
    }}>
      <CardContent sx={{ 
        flexGrow: 1, 
        textAlign: 'center', 
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {icon}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={onClick}
          sx={{ px: 4 }}
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const firstName = session?.user?.user_metadata?.first_name || 'Golfer';

  return (
    <Container maxWidth="lg">
      {/* Welcome Section */}
      <Box sx={{ 
        textAlign: 'center',
        py: 6,
        mb: 6,
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome back, {firstName}!
          </Typography>
          <Typography variant="h6">
            Ready to discover your next favorite golf course?
          </Typography>
        </motion.div>
      </Box>

      {/* Main Actions */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <FeatureCard
            title="Find Clubs"
            description="Search and filter golf clubs based on your preferences and location."
            icon={<SearchIcon sx={{ fontSize: 48, color: 'primary.main' }} />}
            buttonText="Search Now"
            onClick={() => navigate('/find-club')}
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FeatureCard
            title="Get Recommendations"
            description="Receive personalized club recommendations based on your profile."
            icon={<RecommendIcon sx={{ fontSize: 48, color: 'primary.main' }} />}
            buttonText="Recommended Clubs"
            onClick={() => navigate('/recommend-club')}
            delay={0.4}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FeatureCard
            title="Your Profile"
            description="Update your preferences and manage your golf profile."
            icon={<PersonIcon sx={{ fontSize: 48, color: 'primary.main' }} />}
            buttonText="View Profile"
            onClick={() => navigate('/golfer-profile')}
            delay={0.6}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 