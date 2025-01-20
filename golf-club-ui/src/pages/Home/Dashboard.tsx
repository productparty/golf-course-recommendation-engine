import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import RecommendIcon from '@mui/icons-material/Recommend';
import PersonIcon from '@mui/icons-material/Person';
import AddLocationIcon from '@mui/icons-material/AddLocation';

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Find Clubs',
      description: 'Search for golf clubs using filters',
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      path: '/find-club',
      color: '#4CAF50'
    },
    {
      title: 'Recommended Clubs',
      description: 'View personalized club recommendations',
      icon: <RecommendIcon sx={{ fontSize: 40 }} />,
      path: '/recommend-club',
      color: '#2196F3'
    },
    {
      title: 'Profile',
      description: 'Update your preferences and settings',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      path: '/golfer-profile',
      color: '#9C27B0'
    },
    {
      title: 'Submit Club',
      description: 'Add a new golf club to our database',
      icon: <AddLocationIcon sx={{ fontSize: 40 }} />,
      path: '/submit-club',
      color: '#FF9800'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Welcome to Find My Club
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <Box sx={{ 
                color: item.color,
                mb: 2,
                display: 'flex',
                justifyContent: 'center'
              }}>
                {item.icon}
              </Box>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard; 