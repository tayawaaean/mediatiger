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
      '/apis': {
        target: 'http://18.142.174.87:3000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});