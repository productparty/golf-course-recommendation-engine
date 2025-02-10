import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import theme from './theme';
import { ErrorBoundary } from './components/ErrorBoundary';
import { router } from './router';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

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

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <FavoritesProvider>
        <ErrorBoundary 
          fallback={(error) => (
            <div className="p-4 text-red-500">
              <h2>Critical Error</h2>
              <p>{error.message}</p>
              <p>Please refresh the page or contact support</p>
              <button onClick={() => window.location.reload()}>
                Refresh Page
              </button>
            </div>
          )}
        >
          <RouterProvider 
            router={router} 
            fallbackElement={<LoadingFallback />}
            onError={(error) => {
              console.error('Router Error:', error);
              // Log additional error context
              console.log('Router State:', router.state);
              console.log('Environment Variables:', {
                VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
                VITE_API_URL: !!import.meta.env.VITE_API_URL,
                VITE_APP_URL: import.meta.env.VITE_APP_URL
              });
            }}
          />
        </ErrorBoundary>
      </FavoritesProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
