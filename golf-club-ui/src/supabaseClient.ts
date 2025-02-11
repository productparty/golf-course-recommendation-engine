import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Configuration:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Configuration Error:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
}

// Create an in-memory storage implementation
const memoryStorage = new Map<string, string>();

// Custom storage implementation with fallbacks
const customStorage = {
  getItem: (key: string): string | null => {
    try {
      // Try localStorage first
      const localValue = localStorage.getItem(key);
      if (localValue !== null) return localValue;
      
      // Try sessionStorage as first fallback
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue !== null) return sessionValue;
      
      // Use in-memory storage as final fallback
      return memoryStorage.get(key) || null;
    } catch (e) {
      console.warn('Storage access failed, using in-memory storage:', e);
      return memoryStorage.get(key) || null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e1) {
      try {
        sessionStorage.setItem(key, value);
      } catch (e2) {
        console.warn('Falling back to in-memory storage:', e2);
        memoryStorage.set(key, value);
      }
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e1) {
      try {
        sessionStorage.removeItem(key);
      } catch (e2) {
        console.warn('Removing from in-memory storage:', e2);
        memoryStorage.delete(key);
      }
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: customStorage
  }
});

// Add initialization check
if (!supabase) {
  throw new Error('Supabase client failed to initialize! Check env variables');
}
