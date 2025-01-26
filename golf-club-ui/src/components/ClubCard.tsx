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

interface WeatherResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
  };
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

  useEffect(() => {
    const fetchWeather = async () => {
      if (club.latitude && club.longitude) {
        setIsLoadingWeather(true);
        try {
          const response = await getWeatherForecast(club.latitude, club.longitude);
          const formattedWeather: WeatherData[] = response.daily.time.map((time, index) => ({
            date: time,
            maxTemp: response.daily.temperature_2m_max[index],
            minTemp: response.daily.temperature_2m_min[index],
            precipitation: response.daily.precipitation_probability_max[index],
            description: response.daily.weathercode[index].toString()
          }));
          setWeather(formattedWeather);
        } catch (error) {
          console.error('Error fetching weather:', error);
        }
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [club.latitude, club.longitude]);

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        {/* Top Section: Name, Address, Heart */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h2">
              {club.club_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {club.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {club.city}, {club.state} {club.zip_code}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Distance: {club.distance_miles.toFixed(1)} miles
            </Typography>
          </Box>

          {showToggle && onToggleFavorite && (
            <IconButton
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(club.id);
              }}
              className="heart-button"
              sx={{
                padding: '8px',
                ml: 2,
                '& .MuiSvgIcon-root': { fontSize: '24px' }
              }}
            >
              {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          )}
        </Box>

        {/* Club Attributes Section */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Price: {club.price_tier}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GolfCourseIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Difficulty: {club.difficulty}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Holes: {club.number_of_holes}</Typography>
              </Box>
            </Grid>

            {/* Features Grid */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>Features:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {club.driving_range && <FeatureChip label="Driving Range" />}
                {club.putting_green && <FeatureChip label="Putting Green" />}
                {club.practice_bunker && <FeatureChip label="Practice Bunker" />}
                {club.golf_lessons && <FeatureChip label="Lessons" />}
                {club.club_fitting && <FeatureChip label="Club Fitting" />}
                {club.restaurant && <FeatureChip label="Restaurant" />}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Weather Section */}
        {weather.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
              Weather Forecast:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {weather.slice(0, 3).map((day) => (
                <Box key={day.date} sx={{ textAlign: 'center', minWidth: '80px' }}>
                  <Typography variant="caption" display="block">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Typography>
                  {getWeatherInfo(parseInt(day.description, 10)).icon}
                  <Typography variant="caption" display="block">
                    {day.maxTemp}°F
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {showScore && club.score !== undefined && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2, 
              color: club.score >= 80 ? '#2E5A27' : 'primary.main',
              fontWeight: 'medium'
            }}
          >
            Match: {club.score.toFixed(1)}%
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubCard;