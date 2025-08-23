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
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/apis': {
        target: 'http://18.142.174.87:3006',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/apis/, '/api'),
      },
    },
  },
  // Add build-time proxy configuration for Vercel
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});