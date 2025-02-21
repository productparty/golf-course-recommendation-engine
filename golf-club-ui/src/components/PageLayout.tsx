import React, { useState, useEffect, forwardRef } from 'react';
import { Container, Typography, Box, Paper, Button, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, SxProps, Theme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ScrollToTop } from './ScrollToTop';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  titleProps?: SxProps<Theme>;
}

const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(({ children, title, titleProps }, ref) => {
  const [showFavorites, setShowFavorites] = useState(false);
  const { session, initialized } = useAuth(); // Get initialized from useAuth
  const [favorites, setFavorites] = useState<Array<{ id: string; club_name: string }>>([]);

  const fetchFavorites = async () => {
    // Check if initialized before accessing session
    if (!initialized || !session?.user?.id) return;

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        club_id,
        clubs:clubs!inner(club_name)
      `)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    // Check if data is valid before mapping
    if (data) {
      setFavorites(data.map(item => ({
        id: item.club_id,
        club_name: item.clubs[0].club_name
      })));
    }
  };

  // Fetch favorites only when the component mounts and when the session changes
  useEffect(() => {
    fetchFavorites();
  }, [session, initialized]);

  return (
    <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
              mb: 4,
              ...titleProps
            }}
          >
            {title}
          </Typography>
          {children}
        </Paper>
      </Container>

      <Dialog
        open={showFavorites}
        onClose={() => setShowFavorites(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Your Favorite Clubs</DialogTitle>
        <DialogContent>
          <List>
            {favorites.map((favorite) => (
              <ListItem key={favorite.id}>
                <ListItemText primary={favorite.club_name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <ScrollToTop />
    </Box>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;
