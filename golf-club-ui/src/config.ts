export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://nkknwkentrbbyzgqgpfd.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_key'
};

// When deployed, VITE_API_URL will be something like: https://your-app.railway.app