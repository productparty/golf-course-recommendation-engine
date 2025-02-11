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

const App: React.FC = () => {
  // Create error fallback element
  const errorFallback = (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh"
      p={4}
    >
      <h2 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Application Error</h2>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Refresh Page
      </button>
    </Box>
  );

  // Add error handling for initialization
  React.useEffect(() => {
    const checkEnvironment = () => {
      console.log('Environment Check:', {
        VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        VITE_API_URL: !!import.meta.env.VITE_API_URL,
        VITE_APP_URL: import.meta.env.VITE_APP_URL,
        NODE_ENV: import.meta.env.MODE
      });
    };

    checkEnvironment();

    // Add global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global Error:', event.error);
      console.error('Error Stack:', event.error?.stack);
      console.log('Environment Check:', {
        VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        VITE_API_URL: !!import.meta.env.VITE_API_URL,
        VITE_APP_URL: import.meta.env.VITE_APP_URL,
        NODE_ENV: import.meta.env.MODE
      });
    };

    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  return (
    <ErrorBoundary fallback={errorFallback}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <FavoritesProvider>
            <RouterProvider 
              router={router} 
              fallbackElement={<LoadingFallback />}
            />
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
