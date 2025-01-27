import React from 'react';
import { Box, Typography } from '@mui/material';

interface ScreenshotProps {
  src: string;
  title: string;
  description: React.ReactNode;
  align: 'left' | 'right';
}

const Screenshot: React.FC<ScreenshotProps> = ({ src, title, description, align }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: align === 'left' ? 'row' : 'row-reverse', mb: 4 }}>
      <Box sx={{ flex: 1 }}>
        <img src={src} alt={title} style={{ width: '100%', borderRadius: '8px' }} />
      </Box>
      <Box sx={{ flex: 1, pl: 2 }}>
        <Typography variant="h5" fontWeight="bold">{title}</Typography>
        <Box>{description}</Box>
      </Box>
    </Box>
  );
};

export default Screenshot;
