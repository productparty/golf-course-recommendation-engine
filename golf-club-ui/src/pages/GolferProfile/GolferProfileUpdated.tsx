import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Box, 
  SelectChangeEvent,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Switch,
  Divider
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';
import { config } from '../../config';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface GolferProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  handicap_index: number | null;
  preferred_price_range: string | null;
  preferred_difficulty: string | null;
  skill_level: string | null;
  play_frequency: string | null;
  club_id: string | null;
  club_name: string | null;
  preferred_tees: string | null;
  number_of_holes: string | null;
  club_membership: string | null;
  driving_range: boolean | null;
  putting_green: boolean | null;
  chipping_green: boolean | null;
  practice_bunker: boolean | null;
  restaurant: boolean | null;
  lodging_on_site: boolean | null;
  motor_cart: boolean | null;
  pull_cart: boolean | null;
  golf_clubs_rental: boolean | null;
  club_fitting: boolean | null;
  golf_lessons: boolean | null;
}

const GolferProfileUpdated: React.FC = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<GolferProfile>({
    id: '',
    user_id: session?.user.id || '',
    email: session?.user.email || '',
    first_name: null,
    last_name: null,
    handicap_index: null,
    preferred_price_range: null,
    preferred_difficulty: null,
    skill_level: null,
    play_frequency: null,
    club_id: null,
    club_name: null,
    preferred_tees: null,
    number_of_holes: null,
    club_membership: null,
    driving_range: null,
    putting_green: null,
    chipping_green: null,
    practice_bunker: null,
    restaurant: null,
    lodging_on_site: null,
    motor_cart: null,
    pull_cart: null,
    golf_clubs_rental: null,
    club_fitting: null,
    golf_lessons: null,
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  useEffect(() => {
    if (session?.user.id) {
      console.log('Fetching profile for user:', session.user.id);
      fetchProfile();
    } else {
      console.log('No session found');
      setIsLoading(false);
    }
  }, [session?.user.id]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      console.log('Making Supabase request...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();

      if (error && error.code === 'PGRST116') { // No profile found
        // Create new profile
        const newProfile = {
          user_id: session?.user.id,
          email: session?.user.email,
        };
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        if (createdProfile) setProfile(prev => ({ ...prev, ...createdProfile }));
      } else if (error) {
        throw error;
      } else if (data) {
        setProfile(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (field: keyof GolferProfile) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'handicap_index' 
      ? Number(event.target.value) || null 
      : event.target.value;
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof GolferProfile) => (
    event: SelectChangeEvent<string>
  ) => {
    setProfile(prev => ({ ...prev, [field]: event.target.value || null }));
  };

  const handleSwitchChange = (field: keyof GolferProfile) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile(prev => ({ ...prev, [field]: event.target.checked }));
  };

  return (
    <PageLayout title="Golfer Profile">
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Email: {profile.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profile.first_name || ''}
                    onChange={handleTextChange('first_name')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profile.last_name || ''}
                    onChange={handleTextChange('last_name')}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Skill and Play Style */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Skill and Play Style
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Handicap Index"
                    type="number"
                    value={profile.handicap_index || ''}
                    onChange={handleTextChange('handicap_index')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <Typography>Skill Level</Typography>
                    <Select
                      value={profile.skill_level || ''}
                      onChange={handleSelectChange('skill_level')}
                    >
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {/* Rest of skill section... */}
              </Grid>
            </Grid>

            {/* 4. Mobile responsiveness updates */}
            <Grid container spacing={2}>
              {[/* Amenities array */].map(({ field, label }) => (
                <Grid item xs={12} sm={6} md={4} key={field}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile[field as keyof GolferProfile] as boolean}
                        onChange={handleSwitchChange(field as keyof GolferProfile)}
                      />
                    }
                    label={label}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default GolferProfileUpdated;
