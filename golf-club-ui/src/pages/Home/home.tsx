import React from 'react';
import { Container, Box, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './home.css';

const FRONTEND_URL = process.env.FRONTEND_URL;

const Home: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="home-container">
      <div className="top-image">
        <img
          src="/golfclubheader.jpg" // Path to the image in the public folder
          alt="Golf Course"
          className="header-image"
        />
      </div>
      <Container maxWidth="lg" className="links-container">
        <Box className="section">
          <List>
            {isLoggedIn ? (
              <>
                <ListItem>
                  <ListItemText
                    primary={<Link to="/golf-club-ui/find-club">Find Club</Link>}
                    secondary="Search for golf clubs based on location, price range, difficulty, and available technologies."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={<Link to="/golf-club-ui/recommend-club">Recommend Club</Link>}
                    secondary="Get personalized golf club recommendations based on your preferences and location."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={<Link to="/golf-club-ui/submit-club">Submit Club</Link>}
                    secondary="Submit information about a new golf club to be added to our database."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={<Link to="/golf-club-ui/golfer-profile">Golfer Profile</Link>}
                    secondary="View and edit your golfer profile."
                  />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem>
                  <ListItemText
                    primary={<Link to="/golf-club-ui/sign-up">Sign Up</Link>}
                    secondary="Sign up to receive updates and provide feedback about our platform."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={<Link to="/golf-club-ui/create-account">Create Account</Link>}
                    secondary="Create a new account to get started."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={<Link to="/golf-club-ui/login">Log In</Link>}
                    secondary="Log in to your account."
                  />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Container>
    </div>
  );
};

export default Home;