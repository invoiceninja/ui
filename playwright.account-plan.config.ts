import { defineConfig, devices } from '@playwright/test';

// Standalone component-in-browser tests: no API credentials or account resets.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'account-plan-expiry.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
  use: {
    baseURL: 'http://127.0.0.1:4175',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175/tests/browser/fixtures/account-plan/index.html',
    reuseExistingServer: false,
    env: {
      VITE_IS_HOSTED: 'true',
      VITE_SHOW_ACCOUNT_PLAN_EXPIRED_BANNER: 'false',
    },
  },
});
