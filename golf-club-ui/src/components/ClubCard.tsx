import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Chip, Box, Divider, Grid, CircularProgress, Icon } from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import { getWeatherForecast, getWeatherInfo } from '../utils/weather';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { SvgIcon } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';

interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  description: string;
}

interface Club {
  id: string;
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  distance_miles: number;
  score?: number;
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
  match_percentage: number; // Assuming this is the match percentage
}

interface ClubCardProps {
  club: Club;
  showScore?: boolean;
  userPreferences?: Record<string, any>;
  isFavorite?: boolean;
  showToggle?: boolean;
  onToggleFavorite?: (clubId: string) => void;
}

const FeatureChip: React.FC<{ label: string; isMatch?: boolean }> = ({ label, isMatch = false }) => (
  <Chip 
    label={label}
    size="small"
    sx={{ 
      borderColor: isMatch ? '#2E5A27' : 'grey.300',
      color: isMatch ? '#2E5A27' : 'text.secondary',
      backgroundColor: isMatch ? '#2E5A2710' : 'transparent',
      '& .MuiChip-label': {
        fontWeight: isMatch ? 'bold' : 'normal',
      }
    }}
    variant="outlined"
  />
);

const ClubCard: React.FC<ClubCardProps> = ({
  club,
  showScore = false,
  userPreferences,
  isFavorite = false,
  showToggle = false,
  onToggleFavorite
}) => {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const amenities = [
    { label: 'Driving Range', value: club.driving_range },
    { label: 'Putting Green', value: club.putting_green },
    { label: 'Chipping Green', value: club.chipping_green },
    { label: 'Practice Bunker', value: club.practice_bunker },
    { label: 'Restaurant', value: club.restaurant },
    { label: 'Lodging', value: club.lodging_on_site },
  ].filter(({ value }) => value);

  const services = [
    { label: 'Motor Cart', value: club.motor_cart },
    { label: 'Pull Cart', value: club.pull_cart },
    { label: 'Club Rental', value: club.golf_clubs_rental },
    { label: 'Club Fitting', value: club.club_fitting },
    { label: 'Golf Lessons', value: club.golf_lessons },
  ].filter(({ value }) => value);

  const isMatch = (feature: string, value: any) => {
    return userPreferences?.[feature] === value;
  };

  useEffect(() => {
    const fetchWeather = async () => {
      console.log('Club coordinates:', { lat: club.latitude, lng: club.longitude });
      if (club.latitude && club.longitude) {
        setIsLoadingWeather(true);
        try {
          const data = await getWeatherForecast(club.latitude, club.longitude);
          console.log('Weather data:', data);
          
          const weatherData: WeatherData[] = data.daily.time.slice(0, 3).map((date, index) => ({
            date,
            maxTemp: data.daily.temperature_2m_max[index],
            minTemp: data.daily.temperature_2m_min[index],
            precipitation: data.daily.precipitation_probability_max[index],
            description: getWeatherInfo(data.daily.weathercode[index]).description
          }));
          
          setWeather(weatherData);
        } catch (error) {
          console.error('Failed to fetch weather:', error);
        } finally {
          setIsLoadingWeather(false);
        }
      }
    };

    fetchWeather();
  }, [club.latitude, club.longitude]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleFavorite) {
      onToggleFavorite(club.id);
    }
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          {/* Club Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h2">
              {club.club_name}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {club.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {club.city}, {club.state} {club.zip_code}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                Distance: {club.distance_miles.toFixed(1)} miles
              </Typography>
              
              {showScore && club.score !== undefined && (
                <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>
                  Match: {club.score.toFixed(1)}%
                </Typography>
              )}
            </Box>
          </Box>

          {/* Heart Icon */}
          {showToggle && onToggleFavorite && (
            <IconButton
              onClick={handleFavoriteClick}
              className="heart-button"
              sx={{
                display: 'flex',
                alignSelf: 'center',
                padding: '8px',
                ml: 2,
                '& .MuiSvgIcon-root': {
                  fontSize: '24px'
                },
                '&:hover': {
                  color: isFavorite ? '#ff4081' : '#2196F3',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                transition: 'all 0.2s ease-in-out',
                '@media (min-width: 0px)': {
                  display: 'flex'  // Ensure visibility on all screen sizes
                }
              }}
            >
              {isFavorite ? (
                <FavoriteIcon 
                  color="error" 
                  sx={{ 
                    transform: 'scale(1)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }} 
                />
              ) : (
                <FavoriteBorderIcon 
                  sx={{
                    transform: 'scale(1)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                />
              )}
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClubCard;