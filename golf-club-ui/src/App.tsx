import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { ClubDetailPage } from './components/ClubDetailPage';

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
        <BrowserRouter>
          <AuthProvider>
            <FavoritesProvider>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/find" element={<FindClub />} />
                    <Route path="/recommend" element={<RecommendClub />} />
                    <Route path="/clubs/:id" element={<ClubDetailPage />} />
                    <Route path="/create-account" element={<CreateAccount />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/profile" element={<GolferProfile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Layout>
            </FavoritesProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
