import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  
  // Validate required environment variables
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_API_URL',
    'VITE_MAPBOX_TOKEN'
  ];

  requiredVars.forEach(varName => {
    if (!env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  });
  
  return {
    base: '/',
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: !isProd,
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
              if (id.includes('mapbox-gl')) return 'mapbox-gl';
              if (id.includes('supabase')) return 'supabase';
              return 'vendor';
            }
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        '@emotion/react',
        '@emotion/styled',
        '@mui/material/Button',
        '@mui/material/AppBar',
        '@mui/material/Toolbar',
        '@mui/material/Typography',
        '@mui/material/Box'
      ]
    }
  };
});
