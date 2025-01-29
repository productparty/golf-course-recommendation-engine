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

interface FavoriteClub extends GolfClub {
  golfclub_id: string;
}

const isValidCoordinate = (lat: number, lng: number) => 
  !isNaN(lat) && !isNaN(lng) && 
  lat >= -90 && lat <= 90 && 
  lng >= -180 && lng <= 180;

const Favorites: React.FC = () => {
  const { session } = useAuth();
  const [favoriteClubs, setFavoriteClubs] = useState<FavoriteClub[]>([]);
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
        golfclub_id,
        clubs!inner(
          id,
          club_name,
          address,
          city,
          state,
          zip_code,
          latitude,
          longitude,
          price_tier,
          difficulty,
          match_percentage,
          number_of_holes,
          club_membership,
          driving_range,
          putting_green,
          chipping_green,
          practice_bunker,
          restaurant,
          lodging_on_site,
          motor_cart,
          pull_cart,
          golf_clubs_rental,
          club_fitting,
          golf_lessons
        )
      `)
      .eq('profile_id', session.user.id);
      
    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    if (data) {
      const formatted = data?.map(fav => ({
        ...fav.clubs[0],
        golfclub_id: fav.golfclub_id
      })) || [];
      setFavoriteClubs(formatted.filter(fc => 
        fc.id && 
        Object.keys(fc).length === Object.keys({} as FavoriteClub).length
      ));
      setTotalPages(Math.ceil(formatted.length / ITEMS_PER_PAGE));
    }
    setIsLoading(false);
  };

  const getCurrentPageFavorites = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return favoriteClubs.slice(start, start + ITEMS_PER_PAGE);
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
    if (favoriteClubs.length > 0) {
      const newBounds = new mapboxgl.LngLatBounds();
      favoriteClubs.forEach(club => {
        if (club.longitude && club.latitude) {
          newBounds.extend([club.longitude, club.latitude]);
        }
      });
      // Update map bounds immediately
      mapRef.current?.fitBounds(newBounds, { padding: 50 });
    }
  }, [favoriteClubs]);  // Run when favorite clubs change

  return (
    <PageLayout title="Favorite Clubs">
      <div className="favorites-container">
        {favoriteClubs.length > 0 ? (
          <>
            <div className="favorites-map">
              <InteractiveMap 
                clubs={favoriteClubs.filter(c => 
                  c.latitude && c.longitude &&
                  isValidCoordinate(c.latitude, c.longitude)
                )}
                center={mapCenter}
                radius={25}
                onMarkerClick={(clubId) => navigate(`/clubs/${clubId}`)}
                showNumbers={false}
                key="favorites-map"
              />
            </div>
            
            <div className="favorites-list">
              {favoriteClubs.map((club, index) => (
                <ClubCard 
                  key={club.id}
                  club={club}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  showToggle={true}
                  index={(currentPage - 1) * ITEMS_PER_PAGE + index}
                  showScore={false}
                />
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