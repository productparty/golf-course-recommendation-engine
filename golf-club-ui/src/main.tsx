import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { supabase } from './supabaseClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Box } from '@mui/material';

const queryClient = new QueryClient();

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <ErrorBoundary fallback={errorFallback}>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </AuthProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Extra logging for initialization in main.tsx
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Initial Supabase getSession result:', { data, error });
  if (error) {
    console.error('Initial Supabase auth error:', error);
  }
}).catch(err => {
  console.error('Initial Supabase auth error (catch):', err);
});
