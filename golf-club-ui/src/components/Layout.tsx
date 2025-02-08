import React, { Suspense, forwardRef } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';
import Header from './Header';
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

export const Layout = forwardRef<HTMLDivElement, { children?: React.ReactNode }>(
  ({ children }, ref) => {
    return (
      <Box 
        ref={ref}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh' 
        }}
      >
        <Header />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Suspense fallback={<LoadingFallback />}>
            {children || <Outlet />}
          </Suspense>
        </Box>
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
      </Box>
    );
  }
);

Layout.displayName = 'Layout';
