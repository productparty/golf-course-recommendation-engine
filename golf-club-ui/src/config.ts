// Get environment variables
const env = {
  API_URL: import.meta.env.VITE_API_URL,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  APP_URL: import.meta.env.VITE_APP_URL,
  MODE: import.meta.env.MODE
};

// Log environment status
console.log('Environment Variables Status:', {
  API_URL: !!env.API_URL,
  SUPABASE_URL: !!env.SUPABASE_URL,
  SUPABASE_ANON_KEY: !!env.SUPABASE_ANON_KEY,
  APP_URL: !!env.APP_URL,
  MODE: env.MODE
});

// Default values
const defaults = {
  API_URL: 'https://golf-course-recommendation-engin-production.up.railway.app',
};

// Ensure API_URL has https:// prefix and no trailing slash
const formatApiUrl = (url: string) => {
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Export configuration object
export const config = {
  API_URL: formatApiUrl(env.API_URL || defaults.API_URL),
  SUPABASE_URL: env.SUPABASE_URL,
  SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
  APP_URL: env.APP_URL
};

// Validate critical configuration
if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
  throw new Error('Missing critical environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
}

// Only log in development
if (import.meta.env.DEV) {
  console.log('Config:', config);
  console.log('SUPABASE_URL (config.ts):', config.SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY (config.ts):', config.SUPABASE_ANON_KEY);
}

export default config;
