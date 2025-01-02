import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './golf-club-ui', // Ensure the root is set to the correct directory
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
});