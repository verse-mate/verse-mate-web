import { test as setup, expect } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { TEST_EMAIL, TEST_PASSWORD, HAS_AUTH_CREDENTIALS } from './env';

/**
 * Auth setup project — runs once before authenticated specs.
 *
 * Performs an email/password login through the real UI, then dumps the
 * resulting storageState (cookies + localStorage) to a JSON file. Specs
 * that need a signed-in user opt in with:
 *
 *   test.use({ storageState: 'tests/e2e/.auth/user.json' });
 *
 * If E2E_TEST_PASSWORD is unset we still write an empty storageState so
 * dependents don't crash; those specs should `test.skip()` themselves
 * via `HAS_AUTH_CREDENTIALS`.
 */

const AUTH_FILE = 'tests/e2e/.auth/user.json';

setup('authenticate', async ({ page, context }) => {
  // Ensure dir exists regardless of whether we sign in or not
  if (!existsSync(dirname(AUTH_FILE))) mkdirSync(dirname(AUTH_FILE), { recursive: true });

  if (!HAS_AUTH_CREDENTIALS) {
    setup.info().annotations.push({
      type: 'skip-reason',
      description: 'No E2E_TEST_PASSWORD — writing empty storageState',
    });
    await context.storageState({ path: AUTH_FILE });
    return;
  }

  await page.goto('/login');

  // Providers screen → Continue with Email
  await page.getByTestId('login-email-button').click();

  // Email screen
  await page.getByTestId('login-email').fill(TEST_EMAIL);
  await page.getByTestId('login-password').fill(TEST_PASSWORD);
  await page.getByTestId('login-submit').click();

  // Successful login navigates to /menu (per SignInScreen.tsx) and the
  // logout button only renders once isSignedIn flips true.
  await expect(page.getByTestId('menu-item-logout')).toBeVisible({ timeout: 15_000 });

  await context.storageState({ path: AUTH_FILE });
});
