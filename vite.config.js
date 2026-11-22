import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Open Food Facts asks apps to identify themselves with a User-Agent.
const USER_AGENT = 'NutriScan/0.3 (ISTE 340 student project)';

// The browser calls our own dev server (/off-search, /off-api) and Vite
// forwards the request to Open Food Facts. Same origin for the browser, so no
// CORS problems, and real HTTP status codes (429, 503...) reach our code.
const proxy = {
  // Search-a-licious: Open Food Facts' full-text search service
  '/off-search': {
    target: 'https://search.openfoodfacts.org',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/off-search/, ''),
    headers: { 'User-Agent': USER_AGENT },
  },
  // Main API: single products by barcode
  '/off-api': {
    target: 'https://world.openfoodfacts.org',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/off-api/, ''),
    headers: { 'User-Agent': USER_AGENT },
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
});