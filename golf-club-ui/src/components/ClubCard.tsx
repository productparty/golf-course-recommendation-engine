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

interface ClubCardProps {
  club: {
    id: string;
    club_name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    distance_miles: number;
    price_tier: string;
    difficulty: string;
    score?: number;
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
  };
  showScore?: boolean;
  userPreferences?: Record<string, any>;
  isFavorite?: boolean;
  onToggleFavorite?: (clubId: string) => Promise<void>;
  showToggle?: boolean;
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
  onToggleFavorite,
  showToggle = false
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

  const handleFavoriteClick = async () => {
    if (!onToggleFavorite) return;
    setIsLoading(true);
    try {
      await onToggleFavorite(club.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Typography variant="h6" component="h2">
          {club.club_name}
        </Typography>
        
        {/* Show score only for RecommendClub */}
        {club.score !== undefined && (
          <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>
            Match: {club.score.toFixed(1)}%
          </Typography>
        )}

        <Grid container spacing={2}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {club.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {club.city}, {club.state} {club.zip_code}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                Distance: {club.distance_miles.toFixed(1)} miles
              </Typography>
              
              {showToggle && onToggleFavorite && (
                <Box sx={{ 
                  display: { xs: 'block', md: 'none' },
                  mt: 1 
                }}>
                  <IconButton 
                    onClick={handleFavoriteClick}
                    color="primary"
                    disabled={isLoading}
                    sx={{ 
                      padding: '8px',
                      height: '36px',
                      width: '36px',
                      '& .MuiSvgIcon-root': {
                        fontSize: '20px'
                      }
                    }}
                  >
                    {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
              )}
              
              {showScore && (
                <Chip 
                  label={`Match %: ${club.score?.toFixed(1)}`}
                  color="primary"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Grid>

          {/* Right Column - Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Course Info */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Course Info
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <FeatureChip 
                    label={club.price_tier} 
                    isMatch={isMatch('preferred_price_range', club.price_tier)}
                  />
                  <FeatureChip 
                    label={club.difficulty} 
                    isMatch={isMatch('preferred_difficulty', club.difficulty)}
                  />
                  <Chip
                    label={`${club.number_of_holes} Holes`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={club.club_membership}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Amenities */}
              {amenities.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Amenities & Facilities
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {amenities.map(({ label }) => (
                      <FeatureChip key={label} label={label} isMatch={isMatch('preferred_amenities', label)} />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Services */}
              {services.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Equipment & Services
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {services.map(({ label }) => (
                      <FeatureChip key={label} label={label} isMatch={isMatch('preferred_services', label)} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Weather section moved outside the columns */}
          {(weather.length > 0 || isLoadingWeather) && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Weather Forecast
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flexWrap: 'wrap',
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: 1,
                p: 0.75,
                width: '100%'
              }}>
                {isLoadingWeather ? (
                  <CircularProgress size={20} />
                ) : (
                  weather.map((day, index) => (
                    <Box key={index} sx={{ 
                      flex: 1,
                      minWidth: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 0.25,
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </Typography>
                      {(() => {
                        const desc = day.description.toLowerCase();
                        if (desc.includes('rain')) return <UmbrellaIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />;
                        if (desc.includes('cloud')) return <CloudIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />;
                        if (desc.includes('snow')) return <AcUnitIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />;
                        if (desc.includes('thunder')) return <ThunderstormIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />;
                        return <WbSunnyIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />;
                      })()}
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {Math.round(day.maxTemp)}° | {Math.round(day.minTemp)}°
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: '0.65rem' }}
                      >
                        {day.precipitation}% rain
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ClubCard;