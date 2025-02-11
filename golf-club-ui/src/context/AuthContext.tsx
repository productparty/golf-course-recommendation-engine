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
          // Safely handle session data regardless of storage availability
          const safeUser = session?.user ? { 
            ...session.user,
            email: session.user.email ?? null 
          } : null;

          setSession(session);
          setUser(safeUser);
          setInitialized(true);
          setLoading(false);

          // Log auth state change for debugging
          console.log('Auth state changed:', {
            event,
            hasUser: !!safeUser,
            hasSession: !!session
          });
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
      if (error) {
        console.error('Supabase sign-in error:', error);
        throw new Error(error.message || 'Sign-in failed');
      }
      setUser(data.user);
      setSession(data.session);
      navigate('/');
    } catch (error:any) {
      console.error('Sign-in error:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign-out error:', error);
        throw new Error(error.message || 'Sign out failed');
      }
      setUser(null);
      setSession(null);
      navigate('/login');
    } catch (error:any) {
      console.error('Sign-out error:', error);
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        console.error('Supabase sign-up error:', error);
        throw new Error(error.message || 'Sign-up failed');
      }
      setUser(data.user);
      setSession(data.session);
    } catch (error:any) {
      console.error('Sign-up error:', error);
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
