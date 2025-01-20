console.log('Environment Variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  ALL_ENV: import.meta.env
});

// Add debug logging
const API_URL = import.meta.env.VITE_API_URL;
console.log('Raw API URL from env:', API_URL);
console.log('All env variables:', import.meta.env); // Debug all env vars

// Ensure API_URL has https:// prefix and no trailing slash
const formatApiUrl = (url: string | undefined) => {
  if (!url) {
    console.warn('API_URL is undefined in environment variables');
    return process.env.NODE_ENV === 'production' 
      ? 'https://golf-course-recommendation-engin-production.up.railway.app'
      : 'http://localhost:8000';
  }
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const apiUrl = formatApiUrl(API_URL);
console.log('Formatted API URL:', apiUrl); // Debug formatted URL

export const config = {
  API_URL: apiUrl,
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