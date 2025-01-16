import React, { useState } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, SelectChangeEvent } from '@mui/material';

const priceTiers = ['$', '$$', '$$$'];
const difficulties = ['Easy', 'Medium', 'Hard'];
const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const SubmitClub: React.FC = () => {
  const [formData, setFormData] = useState({
    club_name: '',
    city: '',
    state: '',
    price_tier: '',
    difficulty: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:mwatson1983@gmail.com?subject=Submit Club Form Submission&body=${encodeURIComponent(
      `Club Name: ${formData.club_name}\nCity: ${formData.city}\nState: ${formData.state}\nPrice Tier: ${formData.price_tier}\nDifficulty: ${formData.difficulty}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Submit Club
      </Typography>
      <Typography variant="body1" gutterBottom>
        Please fill out the form below to submit a new golf club to our database.
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Club Name"
          name="club_name"
          value={formData.club_name}
          onChange={handleChange}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
        />
        <TextField
          fullWidth
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
        />
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>State</InputLabel>
          <Select
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          >
            <MenuItem value="">
              <em>Select State</em>
            </MenuItem>
            {states.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>Price Tier</InputLabel>
          <Select
            name="price_tier"
            value={formData.price_tier}
            onChange={handleChange}
            required
          >
            <MenuItem value="">
              <em>Select Price Tier</em>
            </MenuItem>
            {priceTiers.map((tier) => (
              <MenuItem key={tier} value={tier}>
                {tier}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>Difficulty</InputLabel>
          <Select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
          >
            <MenuItem value="">
              <em>Select Difficulty</em>
            </MenuItem>
            {difficulties.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default SubmitClub;
