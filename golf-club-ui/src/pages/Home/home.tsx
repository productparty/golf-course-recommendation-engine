import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { Box, Typography } from '@mui/material';

const Home: React.FC = () => {
  const { session } = useAuth();

  return (
    <PageLayout title="Home">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          pt: { xs: 4, sm: 6 },
          px: 2
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: 'center',
            mb: 4,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            fontWeight: 'bold'
          }}
        >
          Welcome to Find My Club
        </Typography>

        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          width: '100%',
          maxWidth: 'sm',
          mt: { xs: 2, sm: 4 },
          mb: { xs: 4, sm: 6 },
          '& .MuiButton-root': {
            width: { xs: '100%', sm: 'auto' }
          }
        }}>
          <Button
            component={Link}
            to="/find-club"
            variant="contained"
            color="primary"
          >
            Find Club
          </Button>
          <Button
            component={Link}
            to="/recommend-club"
            variant="contained"
            color="primary"
          >
            Recommend Club
          </Button>
          <Button
            component={Link}
            to="/submit-club"
            variant="contained"
            color="primary"
          >
            Submit Club
          </Button>
          <Button
            component={Link}
            to="/golfer-profile"
            variant="contained"
            color="primary"
          >
            My Profile
          </Button>
        </Box>
        
        {session ? <Dashboard /> : <LandingPage />}
      </Box>
    </PageLayout>
  );
};

export default Home;
