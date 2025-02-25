import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { FavoriteClub } from '../types/golf-club';

interface FavoritesContextType {
  favorites: string[];
  favoriteClubs: FavoriteClub[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (clubId: string) => Promise<void>;
  isFavorite: (clubId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteClubs, setFavoriteClubs] = useState<FavoriteClub[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    if (!session?.user?.id) {
      setFavorites([]);
      setFavoriteClubs([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Get favorite IDs
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('golfclub_id')
        .eq('profile_id', session.user.id);

      if (favoritesError) throw favoritesError;
      
      const favoriteIds = favoritesData.map((f: { golfclub_id: string }) => f.golfclub_id);
      setFavorites(favoriteIds);
      
      if (favoriteIds.length === 0) {
        setFavoriteClubs([]);
        setIsLoading(false);
        return;
      }

      // Get full club details - use the correct column names from your database
      const fetchFavoriteClubs = async (favoriteIds: string[]) => {
        try {
          // Use the correct relationship name 'golfclub' instead of 'clubs'
          const { data, error } = await supabase
            .from('favorites')
            .select('id, golfclub_id, golfclub:golfclub_id(*)')
            .eq('profile_id', session.user.id)
            .in('golfclub_id', favoriteIds);
          
          if (error) throw error;
          
          // Transform the data to match the expected format
          const clubs = data.map((item: any) => ({
            id: item.golfclub_id,
            ...item.golfclub
          }));
          
          setFavoriteClubs(clubs);
        } catch (err) {
          console.error('Error fetching favorite clubs:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch favorite clubs');
        }
      };

      await fetchFavoriteClubs(favoriteIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (clubId: string) => {
    if (!session?.user?.id) return;

    try {
      const isFav = favorites.includes(clubId);
      
      if (isFav) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('profile_id', session.user.id)
          .eq('golfclub_id', clubId);
          
        if (error) throw error;
        
        setFavorites(prev => prev.filter(id => id !== clubId));
        setFavoriteClubs(prev => prev.filter(club => club.id !== clubId));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ 
            profile_id: session.user.id,
            golfclub_id: clubId
          }]);
          
        if (error) throw error;
        
        setFavorites(prev => [...prev, clubId]);
        // Fetch the full club details for the newly added favorite
        await fetchFavorites();
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
    }
  };

  const isFavorite = (clubId: string) => {
    return favorites.includes(clubId);
  };

  // Fetch favorites when user session changes
  useEffect(() => {
    fetchFavorites();
  }, [session?.user?.id]);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      favoriteClubs, 
      isLoading, 
      error, 
      fetchFavorites, 
      toggleFavorite, 
      isFavorite 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}; 

