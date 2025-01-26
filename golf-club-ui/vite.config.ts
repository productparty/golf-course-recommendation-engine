import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Validate environment variables
  const requiredVars = ['VITE_API_URL', 'VITE_APP_URL'];
  requiredVars.forEach(varName => {
    if (!env[varName]) {
      throw new Error(`${varName} must be set for ${mode} mode`);
    }
  });

  console.log('Building with URLs:', {
    API_URL: env.VITE_API_URL,
    APP_URL: env.VITE_APP_URL
  });

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      sourcemap: true,
      outDir: 'dist',
    },
    define: {
      // Stringify all env variables
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.DEV': mode === 'development',
      'import.meta.env.PROD': mode === 'production'
    }
  };
});