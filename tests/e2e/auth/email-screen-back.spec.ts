import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

/**
 * Auth — email-screen back navigation.
 *
 * SignInScreen.tsx renders two sub-views behind a single URL:
 *   - Providers view: Google/Apple/Email buttons (`login-back-button`
 *     returns to /menu)
 *   - Email view: email/password inputs (`login-screen-back` returns to
 *     the providers view in-place — no URL change)
 *
 * `auth/login.spec.ts` covers the email-view reveal and mode toggle.
 * This spec exercises the in-place back transition from email-view →
 * providers-view via the dedicated `login-screen-back` testid.
 */

test.describe('Auth — email view back navigation', () => {
  test('login-screen-back returns from email view to providers view', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');
    await login.openEmailScreen();
    await expect(login.emailInput).toBeVisible();
    await expect(login.emailScreenBack).toBeVisible();

    await login.emailScreenBack.click();

    // Back to providers view: email/password inputs unmount, provider
    // buttons reappear.
    await expect(login.googleButton).toBeVisible();
    await expect(login.appleButton).toBeVisible();
    await expect(login.emailButton).toBeVisible();
    await expect(login.emailInput).not.toBeVisible();
  });

  test('providers-view back button returns to /menu', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');
    await expect(login.providersBack).toBeVisible();
    await login.providersBack.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)|\/read|\/bible\//);
  });

  test('providers mode toggle swaps signin ↔ signup mode in place', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');

    // /login starts in signin mode — toggle says "Don't have an account?"
    await expect(login.providersModeToggle).toContainText(/don't have an account/i);
    await login.providersModeToggle.click();

    // After toggle the heading flips to the signup copy and the toggle
    // copy inverts.
    await expect(page.getByText(/create your versemate account/i)).toBeVisible();
    await expect(login.providersModeToggle).toContainText(/already have an account/i);
  });
});
