import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box } from '@mui/material';
import './RecommendClub.css';

interface GolfClub {
  club_name: string;
  city: string;
  state: string;
  distance_miles: number;
  price_tier?: string;
  difficulty?: string;
  recommendation_score?: number;
}

const RecommendClub: React.FC = () => {
  const [zipCode, setZipCode] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [recommendations, setRecommendations] = useState<GolfClub[]>([]);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setRecommendationError('You must be logged in to get recommendations.');
        return;
      }

      const params = {
        zip_code: zipCode,
        radius,
      };

      const response = await axios.get<{ results: GolfClub[] }>(
        `${process.env.REACT_APP_API_URL}/get_recommendations/`,
        {
          params,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.results) {
        setRecommendations(response.data.results);
        setRecommendationError(null);
      } else {
        setRecommendationError('No recommendations found.');
      }
    } catch (err) {
      setRecommendationError('Failed to fetch recommendations.');
      console.error('Error fetching recommendations:', err);
    }
  };

  return (
    <div className="recommend-club-container">
      {/* Top Image Section */}
      <div className="top-image">
        <img
          src="/golfclubheader.jpg" // Replace with your image path
          alt="Promotional banner"
          className="header-image"
        />
      </div>

      {/* Content Section */}
      <div className="content">
        {/* Filters Section */}
        <aside className="filters">
          <Typography variant="h4" component="h1" gutterBottom>
            Recommend Club
          </Typography>
          <Typography variant="body1" gutterBottom>
            Use the form below to get personalized golf club recommendations based on your profile.
          </Typography>
          <Box sx={{ mt: 2}}>
            <div className="form-group">
              <div className="input-group" style={{ width: '100%' }}>
                <TextField
                  fullWidth
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter ZIP code"
                  title="Enter the ZIP code of the area you want to search in"
                  margin="normal"
                  sx={{ backgroundColor: 'white', border: 'none', width: '100%' }} // Ensure full width
                />
                <span className="input-group-text">
                  <i className="fas fa-ellipsis-h"></i> {/* Adjust this to your icon */}
                </span>
              </div>
            </div>
            <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
              <InputLabel id="radius-label" shrink>Radius (miles)</InputLabel>
              <Select
                labelId="radius-label"
                label="Radius (miles)"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                title="Select the search radius in miles"
                sx={{ height: '56px' }}
              >
                {[1, 5, 10, 25, 50, 100].map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={fetchRecommendations} variant="contained" color="primary" sx={{ mt: 2 }}>
              Get Recommendations
            </Button>
            {recommendationError && <Typography color="error" sx={{ mt: 2 }}>{recommendationError}</Typography>}
          </Box>
        </aside>

        {/* Results Section */}
        <section className="results">
          <Typography variant="h5" component="h2" gutterBottom>
            Recommendations
          </Typography>
          {recommendations.length > 0 ? (
            <Box sx={{ maxHeight: '600px', overflowY: 'auto', mt: 2 }}>
              <ol className="results">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="result-item">
                    <div className="result-left">
                      <Typography variant="h6">{rec.club_name}</Typography>
                      <Typography variant="body2">{rec.city}, {rec.state} ({rec.distance_miles.toFixed(2)} miles)</Typography>
                      {rec.price_tier && <Typography variant="body2">Price Range: {rec.price_tier}</Typography>}
                      {rec.difficulty && <Typography variant="body2">Difficulty Level: {rec.difficulty}</Typography>}
                      {rec.recommendation_score !== undefined && (
                        <Typography variant="body2">Recommendation Score: {rec.recommendation_score.toFixed(2)}</Typography>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Box>
          ) : (
            <Typography variant="body1">No recommendations found.</Typography>
          )}
        </section>
      </div>
    </div>
  );
};

export default RecommendClub;
