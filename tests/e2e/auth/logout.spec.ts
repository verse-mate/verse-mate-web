import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { MenuPage } from '../pages/menu.page';
import { HAS_AUTH_CREDENTIALS, TEST_EMAIL, TEST_PASSWORD, skipReasonNoAuth } from '../fixtures/env';

/**
 * Auth — logout flow.
 *
 * Maps to FEATURES.md §3.1 (Logout) and §3.7 (Menu → Logout when signed in).
 *
 * Signs in on its own session, because signing out revokes the token in use.
 * Skipped cleanly without `E2E_TEST_PASSWORD`.
 */

test.skip(({ viewport }) => !!viewport && viewport.width >= 1024, 'Mobile menu only');

test.describe('Auth — logout', () => {
  test.skip(!HAS_AUTH_CREDENTIALS, skipReasonNoAuth);

  test('signed-in user sees Logout in menu, signing out clears auth state', async ({ page }) => {
    const login = new LoginPage(page);
    const menu = new MenuPage(page);
    await login.goto('/login');
    await login.signIn(TEST_EMAIL, TEST_PASSWORD);
    await expect(page).toHaveURL(/\/menu(?:\/|$)/, { timeout: 15_000 });

    // While signed in, the bottom button shows "Logout" (red text)
    await expect(menu.logout).toBeVisible({ timeout: 10_000 });

    await menu.logout.click();

    // After logout, the user should be redirected (the app routes them to
    // /read or back to login depending on flow). We assert that the
    // logged-in indicator (logout button) is no longer visible.
    await page.waitForTimeout(1000);
    await menu.goto();
    await expect(menu.login).toBeVisible({ timeout: 10_000 });
    await expect(menu.logout).not.toBeVisible();
  });
});
