import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any;
  session: any;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  initialized: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  getToken: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          // Enhanced storage check with timeout
          let storageAvailable = false;
          try {
            const testKey = `sb-storage-test-${Date.now()}`;
            localStorage.setItem(testKey, "test");
            localStorage.removeItem(testKey);
            storageAvailable = true;
          } catch (e) {
            console.error('Storage access error:', e);
            setError(new Error('Please enable browser storage/cookies for proper functionality'));
            setInitialized(true);
            setLoading(false);
            return;
          }

          if (!storageAvailable) {
            console.error('Storage persistently unavailable');
            return;
          }
          
          // Safely handle session data
          const safeUser = session?.user ? { 
            ...session.user,
            // Optional: Add null checks for nested properties
            email: session.user.email ?? null 
          } : null;

          setSession(session);
          setUser(safeUser);
          setInitialized(true);
        } catch (error) {
          console.error('Auth state change error:', error);
          setError(error instanceof Error ? error : new Error('Auth update failed'));
        }
      }
    );

    const initAuth = async () => {
      try {
        if (supabase) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          setSession(session);
          setUser(session?.user ?? null);
          setInitialized(true);
        } else {
          console.warn('Supabase client not initialized');
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error instanceof Error ? error : new Error('Authentication failed'));
        setInitialized(true);
        setLoading(false);
      }
    };

    initAuth();
    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        navigate('/');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const value = {
    user,
    session,
    initialized,
    signIn,
    signOut,
    getToken,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
