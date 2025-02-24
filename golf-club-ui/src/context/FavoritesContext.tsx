import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import type { FavoriteRecord } from '../types/golf-club';

interface FavoritesContextType {
  favorites: string[];
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  refreshFavorites: async () => {},
});

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { session } = useAuth();

  const refreshFavorites = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('favorites')
      .select('golfclub_id')
      .eq('profile_id', session.user.id);

    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    if (data) {
      setFavorites(data.map(fav => fav.golfclub_id));
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [session?.user?.id]);

  return (
    <FavoritesContext.Provider value={{ favorites, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext); 
