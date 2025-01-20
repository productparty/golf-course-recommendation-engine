import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import { TestConnection } from '../../components/TestConnection';

const Home = () => {
  const { session } = useAuth();

  return (
    <>
      {session ? <Dashboard /> : <LandingPage />}
      <TestConnection />
    </>
  );
};

export default Home;
