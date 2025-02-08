import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import theme from './theme';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Typography, Button } from '@mui/material';
import { ClubDetail } from './pages/ClubDetail/ClubDetail';

// Lazy load components
const FindClub = React.lazy(() => import('./pages/FindClub/FindClubUpdated'));
const RecommendClub = React.lazy(() => import('./pages/RecommendClub/RecommendClubUpdated'));
const CreateAccount = React.lazy(() => import('./pages/CreateAccount/CreateAccount'));
const Favorites = React.lazy(() => import('./pages/Favorites/Favorites'));
const GolferProfile = React.lazy(() => import('./pages/GolferProfile/GolferProfileUpdated'));
const Home = React.lazy(() => import('./pages/Home/LandingPage'));
const Login = React.lazy(() => import('./pages/login/Login'));

const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

const ErrorFallback = () => (
  <Box p={4} role="alert">
    <Typography variant="h4" color="error">
      Something went wrong
    </Typography>
    <Button onClick={() => window.location.reload()}>
      Refresh Page
    </Button>
  </Box>
);

const App = () => {
  console.log('Environment:', {
    VITE_ENV: import.meta.env.VITE_ENV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_MAPBOX_TOKEN: !!import.meta.env.VITE_MAPBOX_TOKEN
  });

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <FavoritesProvider>
            <Suspense fallback={<LoadingFallback />}>
              <RouterProvider router={router} />
            </Suspense>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
