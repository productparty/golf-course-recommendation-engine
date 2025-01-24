import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Divider, Grid } from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';

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
  };
  showScore?: boolean;
  userPreferences?: Record<string, any>;
}

const FeatureChip: React.FC<{ label: string; isMatch?: boolean }> = ({ label, isMatch = false }) => (
  <Chip 
    label={label}
    size="small"
    sx={{ 
      borderColor: isMatch ? 'success.main' : 'grey.300',
      color: isMatch ? 'success.main' : 'text.secondary',
      '& .MuiChip-label': {
        fontWeight: isMatch ? 'bold' : 'normal',
      }
    }}
    variant="outlined"
  />
);

const ClubCard: React.FC<ClubCardProps> = ({ club, showScore = false, userPreferences }) => {
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

  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Grid container spacing={2}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" component="div" gutterBottom>
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
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ClubCard; 