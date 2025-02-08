import React, { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';

interface StatisticBoxProps {
  number: string;
  label: string;
  color: string;
}

const StatisticBox = forwardRef<HTMLDivElement, StatisticBoxProps>(
  ({ number, label, color }, ref) => {
    return (
      <Box
        ref={ref}
        sx={{ 
          backgroundColor: color,
          borderRadius: 2,
          padding: 2,
          textAlign: 'center',
          boxShadow: 1
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'black' }}>
          {number}
        </Typography>
        <Typography variant="body1" sx={{ color: 'gray' }}>
          {label}
        </Typography>
      </Box>
    );
  }
);

StatisticBox.displayName = 'StatisticBox';

export default StatisticBox;
