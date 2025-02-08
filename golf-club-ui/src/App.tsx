import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import theme from './theme';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Typography, Button } from '@mui/material';
import { router } from './router';

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
