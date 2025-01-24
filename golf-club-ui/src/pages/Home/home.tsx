import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import PageLayout from '../../components/PageLayout';

const Home: React.FC = () => {
  const { session } = useAuth();

  return (
    <PageLayout title="">
      {session ? <Dashboard /> : <LandingPage />}
    </PageLayout>
  );
};

export default Home;
