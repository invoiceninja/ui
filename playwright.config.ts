import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

/**
 * Read environment variables from file.
 * Playwright uses .env.testing if it exists, falling back to .env.
 */
config({ path: '.env.testing', override: true });
config();

const accountCount = positiveInt(
  process.env.PLAYWRIGHT_ACCOUNT_COUNT || process.env.E2E_ACCOUNT_COUNT,
  8
);
const workerCount = positiveInt(process.env.PLAYWRIGHT_WORKERS, accountCount);

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || '', 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup',
  /* Maximum time one test can run for. */
  timeout: 30000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Spec files run in parallel, while tests inside each spec file run serially. */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Default to one worker per configured account lane. */
  workers: workerCount,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /** Screenshots & videos. */
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        bypassCSP: true,
        launchOptions: {
          args: ['--disable-web-security'],
        },
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { channel: 'chrome' },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Serve the production build for tests.
   * Build first with: npx vite build --mode testing
   * This ensures VITE_* vars are loaded from .env.testing */
  webServer: {
    command: 'npx vite build --mode testing && npx vite preview',
    port: 4173,
    reuseExistingServer: true,
    timeout: 180_000, // give the build ~3 min to settle
  },
});
