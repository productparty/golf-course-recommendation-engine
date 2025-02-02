import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';
import Header from './Header';

export const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <ScrollToTop />
    </Box>
  );
}; 