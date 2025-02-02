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
      'process.env': env
    }
  };
});