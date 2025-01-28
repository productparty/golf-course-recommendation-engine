import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import ClubCard from '../../components/ClubCard';
import PageLayout from '../../components/PageLayout';
import { InteractiveMap } from '../../components/InteractiveMap';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';

interface GolfClub {
  id: string;
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  distance_miles?: number;
  price_tier: string;
  difficulty: string;
  number_of_holes: string;
  club_membership: string;
  driving_range: boolean;
  putting_green: boolean;
  chipping_green: boolean;
  practice_bunker: boolean;
  restaurant: boolean;
  lodging_on_site: boolean;
  motor_cart: boolean;
  pull_cart: boolean;
  golf_clubs_rental: boolean;
  club_fitting: boolean;
  golf_lessons: boolean;
  latitude?: number;
  longitude?: number;
  match_percentage: number;
}

interface FavoriteItem {
  id: string;
  golfclub_id: string;
  golfclub: GolfClub;
}

const Favorites: React.FC = () => {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;  // Show 5 items per page
  const [mapCenter, setMapCenter] = useState<[number, number]>([-98.5795, 39.8283]);
  const navigate = useNavigate();
  const mapRef = React.useRef<mapboxgl.Map | null>(null);

  const fetchFavorites = async () => {
    if (!session?.user?.id) return;
    
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        golfclub_id,
        golfclub:golfclub(*)
      `)
      .eq('profile_id', session.user.id);
      
    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    const transformedData: FavoriteItem[] = data.map((item: any) => ({
      id: item.id,
      golfclub_id: item.golfclub_id,
      golfclub: item.golfclub // No need to access [0] since it's a single object
    }));
    
    setFavorites(transformedData);
    setTotalPages(Math.ceil(transformedData.length / ITEMS_PER_PAGE));
    setIsLoading(false);
  };

  const getCurrentPageFavorites = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return favorites.slice(start, start + ITEMS_PER_PAGE);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handleToggleFavorite = async (clubId: string) => {
    if (!session?.user?.id) return;
    
    await supabase
      .from('favorites')
      .delete()
      .eq('profile_id', session.user.id)
      .eq('golfclub_id', clubId);
      
    // Refresh favorites after removing
    fetchFavorites();
  };

  useEffect(() => {
    fetchFavorites();
  }, [session?.user?.id]);

  useEffect(() => {
    if (favorites.length > 0) {
      const newBounds = new mapboxgl.LngLatBounds();
      favorites.forEach(club => {
        if (club.golfclub.longitude && club.golfclub.latitude) {
          newBounds.extend([club.golfclub.longitude, club.golfclub.latitude]);
        }
      });
      // Update map bounds immediately
      mapRef.current?.fitBounds(newBounds, { padding: 50 });
    }
  }, [favorites]);  // Run when favorite clubs change

  return (
    <PageLayout title="Favorite Clubs">
      <div className="favorites-container">
        {favorites.length > 0 ? (
          <>
            <div className="favorites-map">
              <InteractiveMap 
                clubs={favorites.map(f => f.golfclub)}
                center={mapCenter}
                radius={25}
                onMarkerClick={(clubId) => navigate(`/clubs/${clubId}`)}
                showNumbers={false}
                key="favorites-map"
              />
            </div>
            
            <div className="favorites-list">
              {favorites.map((club) => (
                <ClubCard 
                  key={club.id}
                  club={club.golfclub}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  showToggle={true} index={0} showScore={false}                />
              ))}
            </div>
          </>
        ) : (
          <Alert severity="info">
            You haven't added any clubs to your favorites yet.
          </Alert>
        )}
      </div>
    </PageLayout>
  );
};

export default Favorites; 