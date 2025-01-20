export const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

export const debugApiConfig = () => {
  console.log('API URL:', API_BASE_URL);
  console.log('Environment:', import.meta.env.MODE);
}; 