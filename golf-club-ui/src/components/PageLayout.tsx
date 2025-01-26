import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import Header from './header';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title }) => {
  return (
    <>
      <Header />
      <div>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4,
              mb: 4,
              backgroundColor: 'background.paper',
              borderRadius: 2
            }}
          >
            <Typography 
              variant="h5" 
              component="h1" 
              gutterBottom
              sx={{ 
                color: 'primary.main',
                fontWeight: 'medium',
                mb: 4
              }}
            >
              {title}
            </Typography>
            {children}
          </Paper>
        </Container>
      </div>
    </>
  );
};

export default PageLayout; 