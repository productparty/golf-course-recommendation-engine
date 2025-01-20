import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  if (!env.VITE_API_URL) {
    console.warn('VITE_API_URL is not set in environment variables');
  }

  return {
    base: '/',
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true
    },
    define: {
      'import.meta.env': JSON.stringify({
        VITE_API_URL: env.VITE_API_URL || '',
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
        VITE_APP_URL: env.VITE_APP_URL,
        MODE: mode
      })
    }
  };
});