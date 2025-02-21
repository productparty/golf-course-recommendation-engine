import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/find-club', label: 'Find Club' },
    { path: '/recommend-club', label: 'Recommend Club' },
    { path: '/favorites', label: 'Favorites' }
  ];

  return (
    <PageLayout title="Home">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Golf Club
        </Typography>
        <Stack spacing={2} sx={{ mt: 4 }}>
          {menuItems.map(item => (
            <Button 
              key={item.path}
              variant="contained"
              onClick={() => navigate(item.path)}
              fullWidth
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Box>
    </PageLayout>
  );
};

export default HomePage; 