import React, { forwardRef } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = forwardRef<HTMLDivElement>((props, ref) => {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AppBar ref={ref} position="static" sx={{ bgcolor: '#2E8B57' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to={session ? '/dashboard' : '/'} 
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            flexGrow: 0,
            marginRight: 4
          }}
        >
          Find My Club
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {session && (
            <>
              <Button color="inherit" component={Link} to="/dashboard">Home</Button>
              <Button color="inherit" component={Link} to="/find-club">Find Club</Button>
              <Button color="inherit" component={Link} to="/recommend-club">Recommend Club</Button>
              <Button color="inherit" component={Link} to="/favorites">Favorites</Button>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          )}
          {!session && (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/create-account">Sign Up</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
});

Header.displayName = 'Header';

export default Header;
