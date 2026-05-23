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

  // Navigate to root (only path guaranteed to return 200 on staging CDN).
  // Sub-paths like /login all 307-redirect to / regardless of auth state,
  // so URL-based detection is unreliable. Instead open the menu to check.
  await page.goto('/');
  await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});

  // Open the hamburger menu — try testid first, fall back to role.
  const menuButton = page.getByTestId('hamburger-menu-button').or(
    page.getByRole('button', { name: /open menu/i })
  ).first();
  await menuButton.click();

  // Wait for the menu to render (testid may be absent on older staging builds).
  const helpMenuItem = page.getByTestId('menu-item-help')
    .or(page.getByRole('button', { name: /^help$/i }));
  await helpMenuItem.waitFor({ state: 'visible', timeout: 10_000 });

  const logoutItem = page.getByTestId('menu-item-logout')
    .or(page.getByRole('button', { name: /^sign out$/i }));
  const alreadySignedIn = await logoutItem.isVisible({ timeout: 2_000 }).catch(() => false);

  if (alreadySignedIn) {
    setup.info().annotations.push({
      type: 'info',
      description: 'Already authenticated (Sign Out visible in menu); reusing session.',
    });
    await context.storageState({ path: AUTH_FILE });
    return;
  }

  // Click Sign In from within the menu. On staging the SPA may trigger a full page reload
  // which the CDN 307s back to /; React then re-mounts and client-side routes to /login.
  // Wait up to 15 s for the login providers screen to appear.
  const loginItem = page.getByTestId('menu-item-login')
    .or(page.getByRole('button', { name: /^sign in$/i }));
  await loginItem.click();
  await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});

  // Providers screen → Continue with Email
  await page.getByTestId('login-email-button')
    .or(page.getByRole('button', { name: /continue with email/i }))
    .click();

  // Email/password screen
  await page.getByTestId('login-email')
    .or(page.locator('input[type="email"]'))
    .or(page.getByPlaceholder(/example\.com/i))
    .fill(TEST_EMAIL);
  await page.getByTestId('login-password')
    .or(page.locator('input[type="password"]'))
    .fill(TEST_PASSWORD);
  await page.getByTestId('login-submit')
    .or(page.getByRole('button', { name: /^sign in$/i }))
    .click();

  // Successful login: hamburger menu button reappears (or Sign Out in menu)
  await page.getByTestId('hamburger-menu-button')
    .or(page.getByRole('button', { name: /open menu/i }))
    .first()
    .waitFor({ state: 'visible', timeout: 15_000 });

  await context.storageState({ path: AUTH_FILE });
});
