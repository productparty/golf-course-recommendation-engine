import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';

const PasswordResetConfirm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the access token in the URL (Supabase adds this)
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      
      setMessage('Password updated successfully');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Set New Password">
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Set New Password
          </Typography>
          
          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="new-password"
            />
            
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="new-password"
              error={password !== confirmPassword && confirmPassword !== ''}
              helperText={
                password !== confirmPassword && confirmPassword !== '' 
                  ? 'Passwords do not match' 
                  : ''
              }
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || password !== confirmPassword}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default PasswordResetConfirm; 