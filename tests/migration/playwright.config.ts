import { defineConfig, devices } from '@playwright/test';

/**
 * Standalone Playwright config for migration verification tests.
 * Bypasses the lovable-agent wrapper config used by playwright.config.ts
 * at the repo root, since these tests have different requirements
 * (custom webServer, cookie inspection, network interception).
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  // Long timeout for hooks (worker.spec.ts boots wrangler dev which takes
  // 30-60s on cold start with build + bindings)
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer needed for prod-login.spec.ts; the routes.spec.ts suite
  // boots its own dev server via webServer in the dev-server config below
  // when run separately.
});
