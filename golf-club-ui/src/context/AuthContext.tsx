import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  initialized: false,
  signIn: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('initAuth - getSession Result:', { session, error });
        if (error) {
          console.error('Supabase getSession error:', error);
        } else if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('initAuth error:', error);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    console.log('signIn - Start', { email, password });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('signIn - Supabase result:', { data, error });
      if (error) {
        console.error('Supabase sign-in error:', error);
        throw new Error(error.message || 'Sign-in failed');
      }
      setUser(data.user);
      navigate('/');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  const value = {
    user,
    initialized,
    signIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {initialized ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
