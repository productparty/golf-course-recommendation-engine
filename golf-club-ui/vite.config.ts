import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('Environment Variables:', {
    VITE_API_URL: env.VITE_API_URL,
    MODE: mode
  });

  return {
    base: '/',
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      'import.meta.env': JSON.stringify({
        VITE_API_URL: env.VITE_API_URL,
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
        VITE_APP_URL: env.VITE_APP_URL,
        MODE: mode
      }),
      'process.env': {}
    }
  };
});