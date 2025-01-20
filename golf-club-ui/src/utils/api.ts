import { config } from '../config';

export const debugApiConfig = () => {
  console.log('API URL from config:', config.API_URL);
  console.log('Environment:', import.meta.env.MODE);
  console.log('Raw VITE_API_URL:', import.meta.env.VITE_API_URL);
};

// Export a configured API URL that will throw if not set
export const getApiUrl = () => {
  if (!config.API_URL) {
    throw new Error('API_URL is not configured');
  }
  return config.API_URL;
}; 