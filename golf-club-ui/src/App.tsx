import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import theme from './theme';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Lazy load components
const FindClub = React.lazy(() => import('./pages/FindClub/FindClubUpdatedv3'));
const RecommendClub = React.lazy(() => import('./pages/RecommendClub/RecommendClubv3'));

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

const App = () => {
  console.log('Environment:', {
    VITE_ENV: import.meta.env.VITE_ENV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_MAPBOX_TOKEN: !!import.meta.env.VITE_MAPBOX_TOKEN
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <FavoritesProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<FindClub />} />
                <Route path="/recommend" element={<RecommendClub />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </FavoritesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;