import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <ScrollToTop />
    </Box>
  );
}; 