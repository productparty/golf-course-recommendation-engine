import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user } = useAuth();
  
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
        <Button component={Link} to="/">Find Clubs</Button>
        <Button component={Link} to="/recommend">Recommendations</Button>
      </Toolbar>
    </AppBar>
  );
}