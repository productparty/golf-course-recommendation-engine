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
        const response = await fetch(`${config.API_URL}/api/get-golfer-profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [session]);

  return { profile, error };
}; 