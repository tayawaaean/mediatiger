import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://18.142.174.87:3006',
        changeOrigin: true,
      },
      '/apis': {
        target: 'http://18.142.174.87:3006',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apis/, '/api'),
      },
    },
  },
});