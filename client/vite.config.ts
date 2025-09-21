import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Minimal client-scoped Vite config. Run Vite from the `client/` folder.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
