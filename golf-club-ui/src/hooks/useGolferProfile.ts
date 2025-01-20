import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

interface GolferProfile {
  id: string;
  preferred_price_range: string;
  preferred_difficulty: string;
}

export const useGolferProfile = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<GolferProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return;
      
      try {
        console.log('API URL in useGolferProfile:', config.API_URL); // Debug log
        const apiUrl = `${config.API_URL}/api/get-golfer-profile`;
        console.log('Fetching profile from:', apiUrl); // Debug log

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
        console.error('Error fetching profile:', errorMessage);
        setError(errorMessage);
      }
    };

    if (config.API_URL) { // Only fetch if API_URL is set
      fetchProfile();
    } else {
      console.error('API_URL is not configured');
      setError('API is not properly configured');
    }
  }, [session]);

  return { profile, error };
}; 