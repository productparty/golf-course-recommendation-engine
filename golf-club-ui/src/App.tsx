import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Box } from '@mui/material';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { lazy, Suspense } from 'react';

const theme = createTheme();
const queryClient = new QueryClient();

const App: React.FC = () => {
  // Create error fallback element (Simplified)
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
          cursor: 'pointer',
        }}
      >
        Refresh Page
      </button>
    </Box>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemeProvider theme={theme}>
            <RouterProvider router={router} />
          </ThemeProvider>
        </LocalizationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
