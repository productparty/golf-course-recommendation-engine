import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';

const Home: React.FC = () => {
  const { session } = useAuth();

  return (
    <>
      {session ? <Dashboard /> : <LandingPage />}
    </>
  );
};

export default Home;
