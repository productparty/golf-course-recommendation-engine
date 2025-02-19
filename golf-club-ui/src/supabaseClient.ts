import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

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

// Create an in-memory storage implementation.  This will be our PRIMARY storage.
const memoryStorage = new Map<string, string>();

// Custom storage implementation prioritizing in-memory storage.
const customStorage = {
  getItem: (key: string): string | null => {
    console.log('customStorage.getItem:', key);

    // FIRST, try to get from memory.
    let value = memoryStorage.get(key) || null;
    console.log('memoryStorage.get result:', key, value);
    if (value) return value;

    // SECOND, try localStorage (but don't throw on error).
    try {
      console.log('Trying localStorage.getItem:', key);
      value = localStorage.getItem(key);
      console.log('localStorage.getItem result:', key, value);
      if (value !== null) {
        // If we got a value from localStorage, store it in memory for future use.
        memoryStorage.set(key, value);
        return value;
      }
    } catch (e) {
      console.warn('localStorage.getItem failed (non-critical):', e); // WARN, don't error
    }

    // THIRD, try sessionStorage (but don't throw on error).
    try {
      console.log('Trying sessionStorage.getItem:', key);
      value = sessionStorage.getItem(key);
      console.log('sessionStorage.getItem result:', key, value);
      if (value !== null) {
        // If we got a value from sessionStorage, store it in memory.
        memoryStorage.set(key, value);
        return value;
      }
    } catch (e) {
      console.warn('sessionStorage.getItem failed (non-critical):', e); // WARN, don't error
    }

    // If all else fails, return null.
    return null;
  },

  setItem: (key: string, value: string) => {
    console.log('customStorage.setItem:', key, value);

    // ALWAYS set in memory.
    memoryStorage.set(key, value);

    // Try localStorage (but don't throw on error).
    try {
      console.log('Trying localStorage.setItem:', key, value);
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage.setItem failed (non-critical):', e); // WARN, don't error
    }

    // Try sessionStorage (but don't throw on error).
    try {
      console.log('Trying sessionStorage.setItem:', key, value);
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn('sessionStorage.setItem failed (non-critical):', e); // WARN, don't error
    }
  },

  removeItem: (key: string) => {
    console.log('customStorage.removeItem:', key);

    // ALWAYS remove from memory.
    memoryStorage.delete(key);

    // Try localStorage (but don't throw on error).
    try {
      console.log('Trying localStorage.removeItem:', key);
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage.removeItem failed (non-critical):', e); // WARN, don't error
    }

    // Try sessionStorage (but don't throw on error).
    try {
      console.log('Trying sessionStorage.removeItem:', key);
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn('sessionStorage.removeItem failed (non-critical):', e); // WARN, don't error
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token'
  },
});

// Add initialization check
if (!supabase) {
  throw new Error('Supabase client failed to initialize! Check env variables');
}
