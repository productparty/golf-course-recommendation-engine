import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, Session, AuthError } from '@supabase/supabase-js'
import { config } from '../config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase with:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseAnonKey 
});

// Create a single supabase instance with the correct keys
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  getToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  getToken: async () => null
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for access token in URL hash (magic link flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      console.log('Found access token in URL (magic link)');
      const expiresIn = parseInt(hashParams.get('expires_in') || '3600');
      const refreshToken = hashParams.get('refresh_token');
      
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
        expires_in: expiresIn,
      });
      
      // Clear the hash from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session check:', initialSession ? 'Found' : 'None');
      setSession(initialSession);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (data?.session) {
        setSession(data.session);
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      return currentSession?.access_token || null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, signOut, signIn, getToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
