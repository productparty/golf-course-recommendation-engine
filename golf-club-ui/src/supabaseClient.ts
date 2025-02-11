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
    console.log('customStorage.getItem:', key);
    let value: string | null = null;
    try {
      // Try localStorage first
      console.log('Trying localStorage.getItem:', key);
      value = localStorage.getItem(key);
      console.log('localStorage.getItem result:', key, value);
      if (value !== null) return value;
      
      // Try sessionStorage as first fallback
      console.log('Trying sessionStorage.getItem:', key);
      value = sessionStorage.getItem(key);
      console.log('sessionStorage.getItem result:', key, value);
      if (value !== null) return value;
      
      // Use in-memory storage as final fallback
      console.log('Trying memoryStorage.get:', key);
      value = memoryStorage.get(key) || null;
      console.log('memoryStorage.get result:', key, value);
      return value;
    } catch (e) {
      console.error('Storage access failed (getItem):', e);
      console.log('Falling back to memoryStorage (getItem):', key);
      return memoryStorage.get(key) || null; // Ensure a fallback
    }
  },
  setItem: (key: string, value: string) => {
    console.log('customStorage.setItem:', key, value);
    try {
      console.log('Trying localStorage.setItem:', key, value);
      localStorage.setItem(key, value);
    } catch (e1) {
      console.error('localStorage.setItem failed:', e1);
      try {
        console.log('Trying sessionStorage.setItem:', key, value);
        sessionStorage.setItem(key, value);
      } catch (e2) {
        console.error('sessionStorage.setItem failed:', e2);
        console.log('Falling back to memoryStorage.setItem:', key, value);
        memoryStorage.set(key, value);
      }
    }
  },
  removeItem: (key: string) => {
    console.log('customStorage.removeItem:', key);
    try {
      console.log('Trying localStorage.removeItem:', key);
      localStorage.removeItem(key);
    } catch (e1) {
      console.error('localStorage.removeItem failed:', e1);
      try {
        console.log('Trying sessionStorage.removeItem:', key);
        sessionStorage.removeItem(key);
      } catch (e2) {
        console.error('sessionStorage.removeItem failed:', e2);
        console.log('Falling back to memoryStorage.removeItem:', key);
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
