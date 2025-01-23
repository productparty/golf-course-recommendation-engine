import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { session } = useAuth();

  return (
    <>
      {session ? <Dashboard /> : <LandingPage />}
      <Button
        component={Link}
        to="/find-club"
        variant="contained"
      >
        Find Club
      </Button>
      <Button
        component={Link}
        to="/recommend-club"
        variant="contained"
      >
        Recommend Club
      </Button>
      <Button
        component={Link}
        to="/golfer-profile"
        variant="contained"
      >
        Golfer Profile
      </Button>
    </>
  );
};

export default Home;
