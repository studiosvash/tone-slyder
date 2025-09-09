import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tone-slyder/shared': path.resolve(__dirname, '../shared')
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  define: {
    global: 'globalThis',
  },
});
