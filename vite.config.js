import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  server: {
    port: 3000,
  },
  build: {
    assetsDir: 'react',
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        manualChunks(id) {
  if (id.includes('node_modules')) {
    const parts = id.split('node_modules/')[1].split('/');
    // Handle scoped packages (like @stripe/stripe-js, @emotion/memoize, etc.)
    if (parts[0].startsWith('@') && parts.length > 1) {
      return parts[0] + '/' + parts[1];
    }
    return parts[0];
  }
},
      },
    },
  },
});
