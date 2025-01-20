import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import PageLayout from '../../components/PageLayout';

interface Club {
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price_tier: string;
  difficulty: string;
  distance_miles: number;
  recommendation_score: number;
}

const FindClubs: React.FC = () => {
  const { session } = useAuth();
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('10');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${config.API_URL}/api/find_clubs/?zip_code=${zipCode}&radius=${radius}&limit=5&offset=0`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }

      const data = await response.json();
      setClubs(data.results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clubs');
      console.error('Error in fetchClubs:', err);
    }
  };

  return (
    <PageLayout title="Find Golf Clubs">
      <Container maxWidth="sm">
        <Box component="form" onSubmit={handleSearch} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="ZIP Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Radius (miles)"
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            Search
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {clubs.map((club) => (
          <Box key={club.club_name} sx={{ mt: 2, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
            <Typography variant="h6">{club.club_name}</Typography>
            <Typography>
              {club.address}, {club.city}, {club.state} {club.zip_code}
            </Typography>
            <Typography>Price: {club.price_tier}</Typography>
            <Typography>Difficulty: {club.difficulty}</Typography>
            <Typography>Distance: {club.distance_miles.toFixed(1)} miles</Typography>
            <Typography>Match Score: {(club.recommendation_score * 100).toFixed(0)}%</Typography>
          </Box>
        ))}
      </Container>
    </PageLayout>
  );
};

export default FindClubs; 