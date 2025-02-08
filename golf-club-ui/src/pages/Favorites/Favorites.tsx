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
    
    try {
      // First get the favorite golf club IDs
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('golfclub_id')
        .eq('profile_id', session.user.id);

      if (favoritesError) throw favoritesError;

      if (!favoritesData || favoritesData.length === 0) {
        setFavoriteClubs([]);
        setTotalPages(0);
        return;
      }

      // Then get the club details for each favorite
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .in('id', favoritesData.map(f => f.golfclub_id));

      if (clubsError) throw clubsError;

      if (clubsData) {
        // Get coordinates for each club
        const clubsWithCoords = await Promise.all(clubsData.map(async (club) => {
          try {
            const response = await fetch(`https://api.zippopotam.us/us/${club.zip_code}`);
            const zipData = await response.json();
            return {
              ...club,
              latitude: Number(zipData.places[0].latitude),
              longitude: Number(zipData.places[0].longitude),
              golfclub_id: club.id
            };
          } catch (error) {
            console.error(`Failed to get coordinates for ${club.zip_code}:`, error);
            return club;
          }
        }));

        setFavoriteClubs(clubsWithCoords);
        setTotalPages(Math.ceil(clubsWithCoords.length / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setIsLoading(false);
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
    if (session) {
      fetchFavorites();
    }
  }, [session, location.pathname]); // Re-fetch when navigating to the page

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
                  onToggleFavorite={() => handleToggleFavorite(club.id)}
                  showToggle={true}
                  index={(currentPage - 1) * ITEMS_PER_PAGE + index}
                  showScore={false}
                  onClick={() => navigate(`/clubs/${club.id}`)}
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
