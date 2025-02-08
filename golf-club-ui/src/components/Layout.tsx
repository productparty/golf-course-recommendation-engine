import React, { Suspense, forwardRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';
import Header from './Header';

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

const Layout = forwardRef<HTMLDivElement, { children?: React.ReactNode }>(
  ({ children }, ref) => {
    return (
      <Box 
        ref={ref}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          width: '100%'
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Header />
          <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
            {children || <Outlet />}
          </Box>
          <ScrollToTop />
        </Suspense>
      </Box>
    );
  }
);

Layout.displayName = 'Layout';

export default Layout;
