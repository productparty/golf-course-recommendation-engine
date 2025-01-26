import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../builderio/navigation/Navigation.module.css';
import { IconButton, Menu, MenuItem, Box, AppBar, Toolbar, Typography, Button, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { supabase } from '../lib/supabase';
import { useFavorites } from '../context/FavoritesContext';

interface GolfClub {
  club_name: string;
  // Add other club properties as needed
}

interface Favorite {
  id: string;
  club_id: string;
  golfclub: GolfClub;  // Changed from clubs to golfclub
}

const Header: React.FC = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const { favorites } = useFavorites();

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = 'path/to/fallback-image.png'; // Provide a path to your fallback image
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    handleClose();
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    navigate('/favorites');
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Find Clubs', path: '/find-club' },
    { label: 'Recommended Clubs', path: '/recommend-club' },
    { label: 'Submit Club', path: '/submit-club' },
    { label: 'My Profile', path: '/golfer-profile' },
  ];

  const favoritesCount = Array.isArray(favorites) ? favorites.length : 0;

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#2E5A27' // Matching landing page green
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          Find My Club
        </Typography>

        {session && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Desktop Navigation */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 3
            }}>
              {navItems.map((item) => (
                <Typography
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {item.label}
                </Typography>
              ))}
              
              <Typography
                onClick={handleMenu}
                sx={{
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                <FavoriteIcon sx={{ fontSize: '20px' }} />
                Favorites {favoritesCount > 0 && `(${favoritesCount})`}
              </Typography>

              <Typography
                onClick={handleSignOut}
                sx={{
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign Out
              </Typography>
            </Box>

            {/* Mobile Menu Icon - Keep as is but update color */}
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleMobileMenuOpen}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                padding: '8px',
                height: '36px', // Slightly reduced
                width: '36px',  // Slightly reduced
                '& .MuiSvgIcon-root': {
                  fontSize: '24px'
                }
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Mobile Menu - Keep existing structure but update styling */}
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              PaperProps={{
                sx: {
                  mt: 2,
                  width: 250
                }
              }}
            >
              {navItems.map((item) => (
                <MenuItem 
                  key={item.label}
                  onClick={() => {
                    handleNavigate(item.path);
                    handleMobileMenuClose();
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
              <MenuItem 
                onClick={(event) => {
                  handleMenu(event);
                  handleMobileMenuClose();
                }}
              >
                <FavoriteIcon sx={{ mr: 2, fontSize: '20px' }} />
                Favorites {favoritesCount > 0 && `(${favoritesCount})`}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;