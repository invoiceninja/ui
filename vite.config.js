import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { createSentryConfig } from './sentry.config.ts';

export default defineConfig(({ command, mode }) => {
  const environment = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const sentry = createSentryConfig(command, environment);

  return {
    define: sentry.define,
    plugins: [react(), ...(sentry.plugin ? [sentry.plugin] : [])],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: 3000,
    },
    build: {
      assetsDir: 'react',
      chunkSizeWarningLimit: 1500,
      sourcemap: sentry.sourcemap,
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .toString();
            }
          },
        },
      },
    },
  };
});
