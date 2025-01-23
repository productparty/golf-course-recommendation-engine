import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Divider } from '@mui/material';
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
}

const ClubCard: React.FC<ClubCardProps> = ({ club, showScore = false }) => {
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

  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            {club.club_name}
          </Typography>
          {showScore && (
            <Chip 
              label={`Score: ${club.score?.toFixed(1)}`}
              color="primary"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {club.address}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {club.city}, {club.state} {club.zip_code}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Distance: {club.distance_miles.toFixed(1)} miles
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Chip 
            label={club.price_tier} 
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={club.difficulty} 
            size="small"
            color={
              club.difficulty === 'Easy' ? 'success' :
              club.difficulty === 'Medium' ? 'warning' : 'error'
            }
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Chip
            icon={<LocationOnIcon />}
            label={`${club.distance_miles.toFixed(1)} miles`}
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<GolfCourseIcon />}
            label={`${club.number_of_holes} Holes`}
            variant="outlined"
            size="small"
          />
          <Chip
            label={club.club_membership}
            variant="outlined"
            size="small"
          />
        </Box>

        {amenities.length > 0 && (
          <>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Amenities
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {amenities.map(({ label }) => (
                <Chip key={label} label={label} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
          </>
        )}

        {services.length > 0 && (
          <>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Services
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {services.map(({ label }) => (
                <Chip key={label} label={label} size="small" color="secondary" variant="outlined" />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubCard; 