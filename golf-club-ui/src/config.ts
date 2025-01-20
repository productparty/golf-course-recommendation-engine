console.log('Environment Variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  ALL_ENV: import.meta.env
});

// Add logging to help debug
const API_URL = import.meta.env.VITE_API_URL;
console.log('API URL:', API_URL); // Add this for debugging

if (!API_URL) {
  console.warn('API_URL is not set in environment variables');
}

export const config = {
  API_URL: API_URL || 'http://localhost:8000', // Fallback for local development
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  APP_URL: import.meta.env.VITE_APP_URL
};

// Debug output
console.log('Environment:', import.meta.env.MODE);
console.log('API URL from env:', import.meta.env.VITE_API_URL);
console.log('Final API URL:', config.API_URL);

// Add this for debugging
console.log('Config:', {
  API_URL: config.API_URL,
  APP_URL: config.APP_URL,
  ENV: import.meta.env.MODE
});

// Add this to help debug
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('APP URL:', import.meta.env.VITE_APP_URL);

// When deployed, VITE_API_URL will be something like: https://your-app.railway.app