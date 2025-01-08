import React from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Fairway Finder
      </Typography>
      <Typography variant="body1" gutterBottom>
        Discover new courses, get personalized recommendations, and more!
      </Typography>
      <Box className="section" sx={{ mt: 2 }}>
        <List>
          <ListItem>
            <ListItemText
              primary={<Link to="/find-course">Find a Course</Link>}
              secondary="Search for golf courses based on location, price range, difficulty, and available technologies."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Link to="/recommend-course">Recommend a Course</Link>}
              secondary="Get personalized golf course recommendations based on your preferences and location."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Link to="/submit-course">Submit a Course</Link>}
              secondary="Submit information about a new golf course to be added to our database."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Link to="/sign-up">Sign Up</Link>}
              secondary="Sign up to receive updates and provide feedback about our platform."
            />
          </ListItem>
        </List>
      </Box>
    </Container>
  );
};

export default Home;