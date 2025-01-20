export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  APP_URL: import.meta.env.VITE_APP_URL
};

// Add this for debugging
console.log('Config:', {
  API_URL: config.API_URL,
  APP_URL: config.APP_URL,
  ENV: import.meta.env.MODE
});

// When deployed, VITE_API_URL will be something like: https://your-app.railway.app