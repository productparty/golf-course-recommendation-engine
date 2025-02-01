import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/golf-club-ui/",
  plugins: [react()],
  build: {
    outDir: 'build',
    sourcemap: true
  },
  server: {
    port: 3000
  }
});