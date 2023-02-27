import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    viewportHeight: 900,
    viewportWidth: 1600,
  },
});
