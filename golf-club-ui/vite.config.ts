import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  // Log environment variables for debugging
  console.log('Environment variables loaded:', {
    VITE_SUPABASE_URL: !!env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!env.VITE_SUPABASE_ANON_KEY,
    VITE_API_URL: !!env.VITE_API_URL,
    NODE_ENV: env.NODE_ENV,
    MODE: mode
  });

  console.log('VITE_SUPABASE_URL in vite.config.ts:', env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY in vite.config.ts:', env.VITE_SUPABASE_ANON_KEY);

  // Define default values for required environment variables
  const defaults = {
    VITE_API_URL: 'https://golf-course-recommendation-engin-production.up.railway.app',
  };

  // Merge environment variables with defaults
  const config = {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
    VITE_API_URL: env.VITE_API_URL || defaults.VITE_API_URL,
  };

  // Validate critical environment variables
  if (!config.VITE_SUPABASE_URL || !config.VITE_SUPABASE_ANON_KEY) {
    console.error('Missing critical environment variables:', {
      VITE_SUPABASE_URL: !!config.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: !!config.VITE_SUPABASE_ANON_KEY
    });
    throw new Error('Missing critical environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/auth': {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'golf-club-ui/dist',
      target: 'esnext',
      sourcemap: true,
      assetsDir: 'assets',
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material/Button',
        '@mui/material/Container',
        '@mui/material/Typography',
        '@mui/material/Box',
        '@emotion/react',
        '@emotion/styled',
        '@mui/material/styles',
        '@mui/icons-material'
      ]
    }
  };
});
