import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_ACCOUNT_PLAN_PORT || 4175);
const baseURL = `http://127.0.0.1:${port}`;

// Standalone component-in-browser tests: no API credentials or account resets.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'account-plan-expiry.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${port} --strictPort`,
    url: `${baseURL}/tests/browser/fixtures/account-plan/index.html`,
    reuseExistingServer: false,
    env: {
      VITE_IS_HOSTED: 'true',
      VITE_SHOW_ACCOUNT_PLAN_EXPIRED_BANNER: 'false',
    },
  },
});
