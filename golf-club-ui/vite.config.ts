import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: true,
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
            map: ['mapbox-gl']
          }
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020'
      }
    },
    esbuild: {
      target: 'es2020'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: {
      port: 3000
    },
    // Make env variables available
    define: {
      'process.env': {
        VITE_ENV: JSON.stringify(env.VITE_ENV),
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        VITE_MAPBOX_TOKEN: JSON.stringify(env.VITE_MAPBOX_TOKEN),
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      }
    }
  };
});