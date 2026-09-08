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
        input:
          mode === 'testing'
            ? {
                app: 'index.html',
                dateRangePicker:
                  'tests/e2e/fixtures/date-range-picker/index.html',
                verificationInput:
                  'tests/e2e/fixtures/verification-input/index.html',
              }
            : undefined,
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
