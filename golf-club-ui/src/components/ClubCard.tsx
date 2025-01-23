import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Divider } from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';

interface ClubCardProps {
  club: {
    id: string;
    name: string;
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
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {club.name}
          </Typography>
          {showScore && club.score !== undefined && (
            <Chip
              icon={<StarIcon />}
              label={`${club.score.toFixed(1)}% Match`}
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<LocationOnIcon />}
            label={`${club.distance_miles.toFixed(1)} miles`}
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<AttachMoneyIcon />}
            label={club.price_tier}
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
            label={`${club.difficulty}`}
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