import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT || 3000);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: (() => {
    const fromEnv = process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : undefined;
    if (fromEnv && Number.isFinite(fromEnv) && fromEnv > 0) return Math.floor(fromEnv);
    return 1;
  })(),
  expect: {
    timeout: 15000,
  },
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: process.env.PW_REUSE_EXISTING === '1',
    timeout: 120 * 1000,
  },
});
