import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'primary.main', color: 'white' }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 0,
            textDecoration: 'none', 
            color: 'inherit',
            marginRight: 2,
            fontWeight: 'bold',
            letterSpacing: 1.1
          }}
        >
          Find My Club
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {session && (
            <>
              <Button component={Link} to="/" color="inherit">Home</Button>
              <Button component={Link} to="/find" color="inherit">Find Clubs</Button>
              <Button component={Link} to="/recommend" color="inherit">Recommendations</Button>
              <Button component={Link} to="/favorites" color="inherit">Favorites</Button>
              <Button component={Link} to="/profile" color="inherit">Profile</Button>
            </>
          )}
          {session ? (
            <Typography 
              component="span" 
              onClick={handleLogout}
              sx={{
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
                color: 'inherit',
                padding: '6px 8px'
              }}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleLogout()}
            >
              Logout
            </Typography>
          ) : (
            <>
              <Button component={Link} to="/create-account" color="inherit">Get Started</Button>
              <Button component={Link} to="/login" color="inherit">Sign In</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
