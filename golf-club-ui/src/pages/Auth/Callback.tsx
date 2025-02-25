import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Process the OAuth callback or email confirmation
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      
      if (event === 'SIGNED_IN' && session) {
        // User has been signed in, redirect to dashboard or home
        navigate('/dashboard', { replace: true });
      } else if (event === 'USER_UPDATED') {
        // Email has been confirmed
        navigate('/login', { replace: true });
      } else {
        // Default fallback
        navigate('/login', { replace: true });
      }
    });

    // Handle the hash fragment for OAuth providers
    const handleHashFragment = async () => {
      const hashFragment = window.location.hash;
      if (hashFragment && hashFragment.includes('access_token')) {
        // Process the hash fragment
        const { data, error } = await supabase.auth.getUser();
        if (data?.user && !error) {
          navigate('/dashboard', { replace: true });
        }
      }
    };

    handleHashFragment();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Processing authentication, please wait...</p>
    </div>
  );
};

export default AuthCallback;