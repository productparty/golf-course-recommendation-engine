import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  
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
            if (id.includes('node_modules/supabase')) return 'supabase';
            if (id.includes('node_modules/@supabase')) return 'supabase';
            if (id.includes('node_modules/mapbox-gl')) return 'mapbox-gl';
            if (id.includes('node_modules/@mui')) return 'mui';
            if (id.includes('node_modules/@emotion')) return 'emotion';
            if (id.includes('node_modules/react')) return 'react';
            if (id.includes('node_modules/react-dom')) return 'react-dom';
            if (id.includes('node_modules/react-router-dom')) return 'react-router-dom';
            return undefined; // Let Vite handle other modules
          }
        }
      }
    }
  };
});
