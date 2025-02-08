import { createClient } from '@supabase/supabase-js'

// Log environment variables availability (not their values for security)
console.log('Environment Variables Status:', {
  VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_APP_URL: !!import.meta.env.VITE_APP_URL,
  VITE_API_URL: !!import.meta.env.VITE_API_URL
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase environment variables');
  console.error('Supabase Configuration Error:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  throw error;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
