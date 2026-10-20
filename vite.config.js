import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative base path for GitHub Pages and Cloudflare Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
