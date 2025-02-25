import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Box } from '@mui/material';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { lazy, Suspense } from 'react';

// Import pages
import Dashboard from './pages/Home/Dashboard';
import FindClubUpdated from './pages/FindClub/FindClubUpdated';
import Favorites from './pages/Favorites/Favorites';
import GolferProfileUpdated from './pages/GolferProfile/GolferProfileUpdated';
import Login from './pages/login/Login';
import SignUp from './pages/CreateAccount/CreateAccount';
import CreateAccountSubmitted from './pages/CreateAccount/CreateAccountSubmitted';
import AuthCallback from './pages/Auth/Callback';
import RecommendClubUpdated from './pages/RecommendClub/RecommendClubUpdated';
import ClubDetail from './pages/ClubDetail/ClubDetail';
import NotFound from './pages/NotFound/NotFound';

const theme = createTheme();
const queryClient = new QueryClient();

// Create router with all routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/find-club',
    element: <FindClubUpdated />,
  },
  {
    path: '/recommend-club',
    element: <RecommendClubUpdated />,
  },
  {
    path: '/favorites',
    element: <Favorites />,
  },
  {
    path: '/profile',
    element: <GolferProfileUpdated />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/create-account',
    element: <SignUp />,
  },
  {
    path: '/create-account-submitted',
    element: <CreateAccountSubmitted />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/clubs/:id',
    element: <ClubDetail />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

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
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
