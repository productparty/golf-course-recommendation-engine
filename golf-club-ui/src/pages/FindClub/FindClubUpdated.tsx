import React, { useState } from 'react';
import { Grid } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import ClubCard from '../../components/ClubCard';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';

interface Club {
  id: string;
  name: string;
  distance_miles: number;
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
}

const FindClubUpdated: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  // ... existing component logic with fixed iteration
  return (
    <PageLayout title="Find Golf Clubs">
      {/* ... existing JSX */}
      {Array.isArray(clubs) && clubs.length > 0 && (
        <Grid container spacing={2}>
          {clubs.map((club) => (
            <Grid item xs={12} md={6} key={club.id}>
              <ClubCard club={club} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageLayout>
  );
};

export default FindClubUpdated; 