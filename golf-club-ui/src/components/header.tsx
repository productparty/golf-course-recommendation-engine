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
            flexGrow: 0, 
            textDecoration: 'none', 
            color: 'inherit',
            mr: 4
          }}
        >
          Golf Club Finder
        </Typography>

        {session && (
          <>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  sx={{ color: 'white', mx: 1 }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                onClick={handleMenu}
                sx={{ mr: 2 }}
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
                    }}
                  >
                    {favorites.length}
                  </Typography>
                )}
              </IconButton>

              <IconButton
                color="inherit"
                edge="end"
                onClick={handleMenu}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {/* Mobile navigation menu */}
              {window.innerWidth < 900 && navItems.map((item) => (
                <MenuItem 
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </MenuItem>
              ))}
              
              <Divider />
              
              {/* Favorites section */}
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
              
              <Divider />
              
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;