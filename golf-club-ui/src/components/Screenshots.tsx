import React, { forwardRef } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';

interface ScreenshotProps {
  src: string;
  title: string;
  description: React.ReactNode;
  align?: 'left' | 'right';
}

interface ScreenshotsProps {
  screenshots: ScreenshotProps[];
}

const Screenshots = forwardRef<HTMLDivElement, ScreenshotsProps>(
  ({ screenshots }, ref) => {
    return (
      <Grid container spacing={4} ref={ref}>
        {screenshots.map((screenshot, index) => (
          <Grid item xs={12} md={6} key={index}>
            <motion.div
              initial={{ opacity: 0, x: screenshot.align === 'left' ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Box sx={{ display: 'flex', flexDirection: screenshot.align === 'left' ? 'row' : 'row-reverse', mb: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <img src={screenshot.src} alt={screenshot.title} style={{ width: '100%', borderRadius: '8px' }} />
                </Box>
                <Box sx={{ flex: 1, pl: 2 }}>
                  <Typography variant="h5" fontWeight="bold">{screenshot.title}</Typography>
                  <Box>{screenshot.description}</Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    );
  }
);

Screenshots.displayName = 'Screenshots';

export default Screenshots;
