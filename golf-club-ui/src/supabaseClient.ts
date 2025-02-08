import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Configuration Error:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = (() => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
    });
  } catch (error) {
    console.error('Supabase client initialization failed:', error);
    throw new Error('Failed to initialize Supabase client');
  }
})();
