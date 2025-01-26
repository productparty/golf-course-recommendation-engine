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
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1
          }}
        >
          GolfMatch
        </Typography>

        {session && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Desktop Navigation */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
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
              
              <Button
                color="inherit"
                onClick={handleMenu}
                startIcon={<FavoriteIcon />}
                sx={{
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Favorites {favorites.length > 0 && `(${favorites.length})`}
              </Button>

              <Button
                color="inherit"
                onClick={handleSignOut}
                sx={{
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Sign Out
              </Button>
            </Box>

            {/* Mobile Menu Icon */}
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleMobileMenuOpen}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                padding: '12px',
                '& .MuiSvgIcon-root': {
                  fontSize: '24px'
                }
              }}
            >
              <MenuIcon />
            </IconButton>

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
              <MenuItem 
                onClick={(event) => {
                  handleMenu(event);
                  handleMobileMenuClose();
                }}
              >
                <FavoriteIcon sx={{ mr: 2, fontSize: '20px' }} />
                Favorites {favorites.length > 0 && `(${favorites.length})`}
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