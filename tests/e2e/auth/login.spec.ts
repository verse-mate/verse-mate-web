import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { MenuPage } from '../pages/menu.page';
import { TEST_EMAIL, TEST_PASSWORD, HAS_AUTH_CREDENTIALS, skipReasonNoAuth } from '../fixtures/env';

/**
 * Auth — email/password login flows.
 *
 * Maps to FEATURES.md §3.1:
 *   - Login (email/password) — happy path  [P0]
 *   - Login — bad credentials error        [P0]
 *   - Login mode toggle (signin ↔ signup)  [P1]
 *
 * The happy path requires real credentials (E2E_TEST_PASSWORD); the bad-creds
 * path always runs because it doesn't depend on a valid account.
 */

test.describe('Auth — login (providers screen)', () => {
  test('renders all three provider buttons + back nav', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');

    await expect(login.googleButton).toBeVisible();
    await expect(login.appleButton).toBeVisible();
    await expect(login.emailButton).toBeVisible();
    await expect(page.getByTestId('login-back-button')).toBeVisible();
  });

  test('switching to email screen reveals email + password inputs', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');
    await login.openEmailScreen();

    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await expect(page.getByTestId('login-mode-toggle')).toBeVisible();
  });

  test('mode toggle reveals the signup name field', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');
    await login.openEmailScreen();
    await expect(login.nameInput).not.toBeVisible();

    await login.modeToggle.click();
    await expect(login.nameInput).toBeVisible();
    await expect(page.getByTestId('signup-submit')).toBeVisible();
  });
});

test.describe('Auth — login (email/password)', () => {
  test('submitting empty fields shows inline error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');
    await login.openEmailScreen();
    await page.getByTestId('login-submit').click();

    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText(/email|password/i);
  });

  test('rejects bad credentials with an error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');
    await login.signIn('not-a-real-account@example.com', 'definitely-wrong');

    await expect(login.errorMessage).toBeVisible({ timeout: 15_000 });
    // Either a network error or an HTTP 401/403 — both surface to the user
    // with a non-empty error string.
    await expect(login.errorMessage).not.toBeEmpty();
  });

  test('happy path: signs in and lands on /menu with logout button visible', async ({
    page,
  }) => {
    test.skip(!HAS_AUTH_CREDENTIALS, skipReasonNoAuth);
    const login = new LoginPage(page);
    const menu = new MenuPage(page);

    await login.goto('/login');
    await login.signIn(TEST_EMAIL, TEST_PASSWORD);

    await expect(menu.logout).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
