import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface ScreenshotProps {
  src: string;
  title: string;
  description: string;
  align?: 'left' | 'right';
}

const Screenshot: React.FC<ScreenshotProps> = ({ src, title, description, align = 'left' }) => (
  <motion.div
    initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: align === 'left' ? 'row' : 'row-reverse' },
      alignItems: 'center',
      gap: 4,
      mb: 8 
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom color="primary">
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {description}
        </Typography>
      </Box>
      <Box sx={{ 
        flex: 1,
        '& img': {
          width: '100%',
          borderRadius: 2,
          boxShadow: 3,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
          }
        }
      }}>
        <img src={src} alt={title} />
      </Box>
    </Box>
  </motion.div>
);

export default Screenshot; 