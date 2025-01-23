import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Divider } from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface CourseCardProps {
  course: {
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
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const amenities = [
    { label: 'Driving Range', value: course.driving_range },
    { label: 'Putting Green', value: course.putting_green },
    { label: 'Chipping Green', value: course.chipping_green },
    { label: 'Practice Bunker', value: course.practice_bunker },
    { label: 'Restaurant', value: course.restaurant },
    { label: 'Lodging', value: course.lodging_on_site },
  ];

  const services = [
    { label: 'Motor Cart', value: course.motor_cart },
    { label: 'Pull Cart', value: course.pull_cart },
    { label: 'Club Rental', value: course.golf_clubs_rental },
    { label: 'Club Fitting', value: course.club_fitting },
    { label: 'Golf Lessons', value: course.golf_lessons },
  ];

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {course.name}
        </Typography>

        {course.score !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              {course.score.toFixed(1)}% Match
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<LocationOnIcon />}
            label={`${course.distance_miles.toFixed(1)} miles`}
            variant="outlined"
          />
          <Chip
            icon={<AttachMoneyIcon />}
            label={course.price_tier}
            variant="outlined"
          />
          <Chip
            icon={<GolfCourseIcon />}
            label={`${course.number_of_holes} Holes`}
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Course Details
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={`Difficulty: ${course.difficulty}`} />
            <Chip size="small" label={`Type: ${course.club_membership}`} />
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Amenities
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
          {amenities
            .filter(({ value }) => value)
            .map(({ label }) => (
              <Chip key={label} label={label} size="small" color="primary" variant="outlined" />
            ))}
        </Box>

        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Services
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {services
            .filter(({ value }) => value)
            .map(({ label }) => (
              <Chip key={label} label={label} size="small" color="secondary" variant="outlined" />
            ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard; 