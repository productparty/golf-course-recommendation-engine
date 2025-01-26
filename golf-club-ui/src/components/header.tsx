import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../builderio/navigation/Navigation.module.css';
import { IconButton, Menu, MenuItem, Box, AppBar, Toolbar, Typography, Button, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { supabase } from '../lib/supabase';

interface Favorite {
  id: string;
  club_id: string;
  clubs: {
    club_name: string;
  } | null;
}

const Header: React.FC = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchFavorites();
  }, [session?.user?.id]);

  const fetchFavorites = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        club_id,
        clubs:clubs!inner(club_name)
      `)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    const transformedData: Favorite[] = data?.map(item => ({
      id: item.id,
      club_id: item.club_id,
      clubs: {
        club_name: item.clubs[0].club_name
      }
    })) || [];

    setFavorites(transformedData);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = 'path/to/fallback-image.png'; // Provide a path to your fallback image
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    handleClose();
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
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
    { label: 'Find Clubs', path: '/find-club' },
    { label: 'Recommended Clubs', path: '/recommend-club' },
    { label: 'Submit Club', path: '/submit-club' },
    { label: 'My Profile', path: '/golfer-profile' },
  ];

  return (
    <AppBar 
      position="static" 
      sx={{
        backgroundColor: 'primary.main',
        boxShadow: 2
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/"
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 600,
            '&:hover': {
              opacity: 0.9
            }
          }}
        >
          Golf Club Finder
        </Typography>

        {session && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Desktop Navigation */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              gap: 2 
            }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Favorites Icon */}
            <IconButton
              color="inherit"
              onClick={handleMenu}
              sx={{ 
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <FavoriteIcon />
              {favorites.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'error.main',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    minWidth: '20px',
                    fontSize: '0.75rem'
                  }}
                >
                  {favorites.length}
                </Typography>
              )}
            </IconButton>

            {/* Mobile Menu Icon */}
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleMobileMenuOpen}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                ml: 1
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Favorites Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 2,
                  width: 250,
                  maxHeight: 400
                }
              }}
            >
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                Favorites
              </Typography>
              {favorites.length === 0 ? (
                <MenuItem disabled>No favorites yet</MenuItem>
              ) : (
                favorites.map((favorite) => (
                  <MenuItem 
                    key={favorite.id}
                    onClick={() => {
                      navigate(`/club/${favorite.club_id}`);
                      handleClose();
                    }}
                  >
                    {favorite.clubs?.club_name || 'Unknown Club'}
                  </MenuItem>
                ))
              )}
            </Menu>

            {/* Mobile Navigation Menu */}
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