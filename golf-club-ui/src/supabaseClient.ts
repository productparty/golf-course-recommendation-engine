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

export const supabase = (() => {
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key) => {
            try { return localStorage.getItem(key) }
            catch (e) { return null }
          },
          setItem: (key, value) => {
            try { localStorage.setItem(key, value) }
            catch (e) { console.warn('Storage setItem error:', e) }
          },
          removeItem: (key) => {
            try { localStorage.removeItem(key) }
            catch (e) { console.warn('Storage removeItem error:', e) }
          }
        }
      }
    });
    console.log('Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error('Supabase client initialization failed:', error);
    throw new Error('Failed to initialize Supabase client');
  }
})();
