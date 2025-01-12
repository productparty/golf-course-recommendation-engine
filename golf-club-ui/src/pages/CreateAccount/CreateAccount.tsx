import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Container, Typography, TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [handicapIndex, setHandicapIndex] = useState('');
  const [preferredPriceRange, setPreferredPriceRange] = useState('');
  const [preferredDifficulty, setPreferredDifficulty] = useState('');
  const [preferredTees, setPreferredTees] = useState(''); // Default to "No Preference"
  const [skillLevel, setSkillLevel] = useState('');
  const [playFrequency, setPlayFrequency] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  interface GolferProfile {
    golfer_id: string;
    email: string;
    first_name: string;
    last_name: string;
    handicap_index: number;
    preferred_price_range: string;
    preferred_difficulty: string;
    preferred_tees: string;
    skill_level: string;
    play_frequency: string;
  }

  const validateInputs = (email: string, password: string) => {
    const errors: { email: string; password: string } = { email: '', password: '' };
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      errors.email = 'Invalid email format.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }
    return errors;
  };

  const handleBlur = (field: string) => {
    const errors = validateInputs(email, password);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [field]: errors[field as keyof typeof errors] || '',
    }));
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const errors = validateInputs(email, password);
    if (errors.email || errors.password) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Insert additional profile data into PostgreSQL database
        const golferProfile: GolferProfile = {
          golfer_id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          handicap_index: parseFloat(handicapIndex) || 0,
          preferred_price_range: preferredPriceRange,
          preferred_difficulty: preferredDifficulty,
          preferred_tees: preferredTees,
          skill_level: skillLevel,
          play_frequency: playFrequency,
        };

        const response = await fetch('http://localhost:8080/api/golfers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(golferProfile),
        });

        if (!response.ok) {
          throw new Error('Failed to create golfer profile');
        }

        setSuccess(true);
        navigate('/login');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error('Error details:', error); // Log detailed error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Create Account
      </Typography>
      <Box component="form" onSubmit={handleSignUp} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
          error={!!fieldErrors.email}
          helperText={fieldErrors.email}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password}
        />
        <TextField
          fullWidth
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
        />
        <TextField
          fullWidth
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          margin="normal"
          sx={{ backgroundColor: 'white' }}
        />
        <TextField
          fullWidth
          label="Handicap Index"
          type="number"
          value={handicapIndex}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (value >= 0 && value <= 40.4) {
              setHandicapIndex(e.target.value);
            }
          }}
          inputProps={{ min: 0, max: 40.4, step: 0.1 }}
          margin="normal"
          sx={{ backgroundColor: 'white' }}
        />
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>Preferred Price Range</InputLabel>
          <Select
            value={preferredPriceRange}
            onChange={(e) => setPreferredPriceRange(e.target.value)}
            label="Preferred Price Range"
          >
            <MenuItem value="$">$</MenuItem>
            <MenuItem value="$$">$$</MenuItem>
            <MenuItem value="$$$">$$$</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>Preferred Difficulty</InputLabel>
          <Select
            value={preferredDifficulty}
            onChange={(e) => setPreferredDifficulty(e.target.value)}
            label="Preferred Difficulty"
          >
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel id="preferred-tees-label">Preferred Tees</InputLabel>
          <Select
            labelId="preferred-tees-label"
            value={preferredTees}
            onChange={(e) => setPreferredTees(e.target.value)}
            label="Preferred Tees"
          >
            <MenuItem value=""></MenuItem>
            <MenuItem value="No Preference">No Preference</MenuItem>
            <MenuItem value="Black">Black</MenuItem>
            <MenuItem value="Blue">Blue</MenuItem>
            <MenuItem value="White">White</MenuItem>
            <MenuItem value="Gold">Gold</MenuItem>
            <MenuItem value="Red">Red</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>Skill Level</InputLabel>
          <Select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            label="Skill Level"
          >
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" sx={{ backgroundColor: 'white' }}>
          <InputLabel>Play Frequency</InputLabel>
          <Select
            value={playFrequency}
            onChange={(e) => setPlayFrequency(e.target.value)}
            label="Play Frequency"
          >
            <MenuItem value="Rarely">Rarely</MenuItem>
            <MenuItem value="Occasionally">Occasionally</MenuItem>
            <MenuItem value="Regularly">Regularly</MenuItem>
            <MenuItem value="Frequently">Frequently</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Loading...' : 'Sign Up'}
        </Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>Account created successfully!</Alert>}
      </Box>
    </Container>
  );
};

export default CreateAccount;
