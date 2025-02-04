import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, session } = useAuth();
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Find My Club
        </Typography>
        {user ? (
          <Button color="inherit">Logout</Button>
        ) : (
          <Button color="inherit">Login</Button>
        )}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {session ? (
            <>
              <Button component={Link} to="/find" color="inherit">Find Clubs</Button>
              <Button component={Link} to="/recommend" color="inherit">Recommendations</Button>
              <Button component={Link} to="/favorites" color="inherit">Favorites</Button>
              <Button component={Link} to="/profile" color="inherit">Profile</Button>
            </>
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