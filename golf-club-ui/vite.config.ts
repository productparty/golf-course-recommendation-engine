import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Load from root

  return {
    root: path.resolve(__dirname, '.'), // Ensure this points to the correct root directory
    base: '/', // Ensure this matches the output directory in Vercel config
    plugins: [react()],
    publicDir: path.resolve(__dirname, 'public'),
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      fs: {
        allow: ['..'],
      },
      proxy: {
        '/api': {
          target: env.REACT_APP_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 4173,
    },
    define: {
      'process.env': {
        REACT_APP_API_URL: env.REACT_APP_API_URL,
        FRONTEND_URL: env.FRONTEND_URL,
      }, // Expose env variables
    },
  };
});
