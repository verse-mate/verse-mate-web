import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { MenuPage } from './pages/menu.page';
import { AboutPage } from './pages/about.page';
import { HelpPage } from './pages/help.page';
import { TEST_EMAIL, TEST_PASSWORD, HAS_AUTH_CREDENTIALS, skipReasonNoAuth } from './fixtures/env';

/**
 * E2E smoke — support pipeline (VER-158).
 *
 * Covers the full authenticated user journey:
 *   Sign in → Menu → About → Contact link → Help form → Submit → success state
 *
 * Requires staging credentials (E2E_TEST_EMAIL / E2E_TEST_PASSWORD).
 * Depends on T2 (VER-156) wiring HelpScreen to the backend and T3 (VER-157)
 * replacing the About Contact mailto with an in-app link. Manual Slack
 * confirmation of the received submission is required before this test
 * can gate R1 mitigation.
 */

test.describe('Support pipeline — help & feedback (authenticated)', () => {
  test.skip(!HAS_AUTH_CREDENTIALS, skipReasonNoAuth);

  test('sign in → About → Contact link navigates to Help screen', async ({ page }) => {
    const login = new LoginPage(page);
    const about = new AboutPage(page);
    const help = new HelpPage(page);

    // Sign in
    await login.goto('/login');
    await login.signIn(TEST_EMAIL, TEST_PASSWORD);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

    // Navigate to About via menu
    await page.goto('/menu/about');
    await about.contactLink.waitFor({ state: 'visible' });

    // Contact link should navigate to the in-app Help screen (T3 requirement:
    // must NOT open a mailto: href). After T3 ships the href becomes /menu/help.
    await about.contactLink.click();
    await expect(page).toHaveURL(/\/menu\/help/, { timeout: 10_000 });
    await expect(help.heading).toBeVisible();
  });

  test('submit help form → success state', async ({ page }) => {
    const login = new LoginPage(page);
    const help = new HelpPage(page);

    // Sign in
    await login.goto('/login');
    await login.signIn(TEST_EMAIL, TEST_PASSWORD);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

    // Navigate directly to the Help screen
    await help.goto();

    // Open topic picker and select the first available topic
    await page.getByRole('button', { name: /select a topic/i }).click();
    const firstTopic = page.locator('button', { hasText: /Bug report|Feature request|Other/i }).first();
    await firstTopic.waitFor({ state: 'visible' });
    await firstTopic.click();

    // Fill in the message
    await help.messageTextarea.fill(
      '[E2E automated test] VER-158 smoke submission — please ignore.',
    );

    // Submit
    await help.submitButton.click();

    // Assert the success state renders ("Message sent.")
    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/thanks for helping us improve/i)).toBeVisible();
  });

  test('success state shows a "Done" / back-to-menu button', async ({ page }) => {
    const login = new LoginPage(page);
    const help = new HelpPage(page);

    await login.goto('/login');
    await login.signIn(TEST_EMAIL, TEST_PASSWORD);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

    await help.goto();

    await page.getByRole('button', { name: /select a topic/i }).click();
    const firstTopic = page.locator('button', { hasText: /Bug report|Feature request|Other/i }).first();
    await firstTopic.waitFor({ state: 'visible' });
    await firstTopic.click();

    await help.messageTextarea.fill('[E2E automated test] VER-158 back-nav check — please ignore.');
    await help.submitButton.click();

    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 15_000 });

    // After success the Submit button is replaced by a Done/Back button.
    const doneButton = page.getByRole('button', { name: /done|back|return/i });
    await expect(doneButton).toBeVisible();
    await doneButton.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
