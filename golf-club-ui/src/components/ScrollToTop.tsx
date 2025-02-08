import { useState, useEffect, forwardRef } from 'react';
import { Box, Button, Zoom } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface ScrollToTopProps {}

export const ScrollToTop = forwardRef<HTMLDivElement, ScrollToTopProps>((props, ref) => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    setVisible(window.pageYOffset > 100);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <Zoom in={visible}>
      <Box
        ref={ref}
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000
        }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{
            minWidth: 'unset',
            borderRadius: '50%',
            width: 48,
            height: 48,
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s'
            }
          }}
          aria-label="Scroll to top"
        >
          <KeyboardArrowUpIcon fontSize="medium" />
        </Button>
      </Box>
    </Zoom>
  );
});
