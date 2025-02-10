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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          console.error('LocalStorage access failed:', e);
          return sessionStorage.getItem(key); // Fallback
        }
      },
      setItem: (key, value) => {
        try { localStorage.setItem(key, value) }
        catch (e) { 
          console.error('Storage setItem error:', e);
          sessionStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        try { localStorage.removeItem(key) }
        catch (e) { 
          console.error('Storage removeItem error:', e);
          sessionStorage.removeItem(key);
        }
      }
    }
  }
});

// Add initialization check
if (!supabase) {
  throw new Error('Supabase client failed to initialize! Check env variables');
}
