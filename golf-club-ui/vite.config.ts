import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: path.resolve(__dirname, '.'),
    base: '/',
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
          target: env.VITE_REACT_APP_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 4173,
    },
    define: {
      'import.meta.env.VITE_REACT_APP_API_URL': JSON.stringify(env.VITE_REACT_APP_API_URL),
      'import.meta.env.MODE': JSON.stringify(env.MODE),
      'import.meta.env.BASE_URL': JSON.stringify(env.BASE_URL),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    envDir: path.resolve(__dirname),
  };
});
