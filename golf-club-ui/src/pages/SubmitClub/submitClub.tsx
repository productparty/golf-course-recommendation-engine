import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, SelectChangeEvent, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { config } from '../../config';

interface ClubData {
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price_tier: string;
  difficulty: string;
}

const priceTiers = ['$', '$$', '$$$'];
const difficulties = ['Easy', 'Medium', 'Hard'];
const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const SubmitClub = () => {
  const { session } = useAuth();
  const [clubData, setClubData] = useState<ClubData>({
    club_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    price_tier: '',
    difficulty: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch(`${config.API_URL}/api/submit-club`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(clubData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit club');
      }

      setSuccess(true);
      setClubData({
        club_name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        price_tier: '',
        difficulty: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit club');
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setClubData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return (
    <PageLayout title="Submit Club">
      <Box display="flex" justifyContent="center" sx={{ mb: 4 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Can't find a specific golf club? Send us a note below and we will get it added.
        </Typography>
      </Box>
      <Container maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Club Name"
            name="club_name"
            value={clubData.club_name}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={clubData.address}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="City"
            name="city"
            value={clubData.city}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="State"
            name="state"
            value={clubData.state}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="ZIP Code"
            name="zip_code"
            value={clubData.zip_code}
            onChange={handleChange}
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
            Submit Club
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Club submitted successfully!
            </Alert>
          )}
        </Box>
      </Container>
    </PageLayout>
  );
};

export default SubmitClub;