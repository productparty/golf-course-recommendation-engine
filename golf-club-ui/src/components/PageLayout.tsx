import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  headerImage?: boolean;
}

const PageLayout = ({ title, children, headerImage = true }: PageLayoutProps) => {
  return (
    <div>
      {headerImage && (
        <div className="top-image">
          <img
            src="/golfclubheader.jpg"
            alt="Golf course header"
            className="header-image"
          />
        </div>
      )}
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
            variant="h4" 
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
  );
};

export default PageLayout; 