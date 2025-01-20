console.log('Environment Variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  ALL_ENV: import.meta.env
});

// Get API URL from environment
const VITE_API_URL = import.meta.env.VITE_API_URL;

if (!VITE_API_URL) {
  throw new Error('VITE_API_URL must be set in environment variables');
}

// Ensure API_URL has https:// prefix and no trailing slash
const formatApiUrl = (url: string) => {
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Export configuration object
export const config = {
  API_URL: formatApiUrl(VITE_API_URL),
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  APP_URL: import.meta.env.VITE_APP_URL
};

// Only log in development
if (import.meta.env.DEV) {
  console.log('Config:', config);
}