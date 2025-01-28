import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Chip, Box, Divider, Grid, CircularProgress, Icon, FormControl, Select } from '@mui/material';
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
import { Link } from 'react-router-dom';

interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  description: string;
}

export interface Club {
  id: string;
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  distance_miles?: number;
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
  match_percentage: number;
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
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (clubId: string) => Promise<void>;
  showToggle: boolean;
  showScore: boolean;
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

const getWeatherIcon = (weatherCode: number) => {
  switch (weatherCode) {
    case 0: // Clear sky
      return <WbSunnyIcon sx={{ color: '#FFB300' }} />;
    case 1:
    case 2:
    case 3: // Cloudy
      return <CloudIcon sx={{ color: '#78909C' }} />;
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65: // Rain
      return <UmbrellaIcon sx={{ color: '#42A5F5' }} />;
    case 71:
    case 73:
    case 75: // Snow
      return <AcUnitIcon sx={{ color: '#90CAF9' }} />;
    case 95: // Thunderstorm
      return <ThunderstormIcon sx={{ color: '#5C6BC0' }} />;
    default:
      return <CloudIcon sx={{ color: '#78909C' }} />;
  }
};

const ClubCard: React.FC<ClubCardProps> = ({ club, index, isFavorite, onToggleFavorite, showToggle }) => {
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
        <Link to={`/clubs/${club.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" align="left">
            {index + 1}. {club.club_name}
          </Typography>
        </Link>
        <Typography variant="body2" align="left">{club.address}</Typography>
        <Typography variant="body2" align="left">{club.city}, {club.state} {club.zip_code}</Typography>
        <Typography variant="body2" align="left">
          Distance: {typeof club.distance_miles === 'number' ? club.distance_miles.toFixed(1) : 'N/A'} miles
        </Typography>

        {showToggle && onToggleFavorite && (
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(club.id);
            }}
            className="heart-button"
            sx={{
              padding: '8px',
              ml: { sm: 2 },
              mb: { xs: 1, sm: 0 },
              width: 'fit-content',
              minWidth: 'auto',
              '& .MuiSvgIcon-root': { 
                fontSize: '24px',
                display: 'block'
              }
            }}
          >
            {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
        )}

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
              Three Day Weather Forecast:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {weather.slice(0, 3).map((day: WeatherData) => (
                <Box key={day.date} sx={{ textAlign: 'center', minWidth: '80px' }}>
                  <Typography variant="caption" display="block">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Typography>
                  {getWeatherIcon(parseInt(day.description, 10))}
                  <Typography variant="caption" display="block">
                    {Math.round(day.maxTemp)}°F
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {typeof club.score === 'number' && (
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