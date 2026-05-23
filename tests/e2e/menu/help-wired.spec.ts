import { test, expect } from '@playwright/test';
import { HelpPage } from '../pages/help.page';
import { LoginPage } from '../pages/login.page';
import { TEST_EMAIL, TEST_PASSWORD, HAS_AUTH_CREDENTIALS, skipReasonNoAuth } from '../fixtures/env';

/**
 * VER-156: HelpScreen wired to backend.
 *
 * S1 — happy path: signed-in user submits form → success state with
 *      "we read every message" copy.
 * S2 — validation: Submit disabled until both topic + message filled.
 * S4 — error retry: API error shows retry CTA, topic/message preserved.
 * S6 — guest sign-in gate: unsigned user visiting /menu/help is
 *      redirected to /login with returnTo query param.
 */

const BASE_API = process.env.VITE_API_URL ?? 'https://api.versemate.org';

// S1 + S2 require auth credentials; S4 and S6 are network-mocked / unauthenticated.

test.describe('S2 — validation gate (no auth needed)', () => {
  test('Submit is disabled until both topic and message are filled', async ({ page }) => {
    // Simulate signed-in state by injecting an access token cookie so the
    // sign-in gate doesn't redirect us away.
    await page.context().addCookies([
      { name: 'accessToken', value: 'fake-token', domain: 'localhost', path: '/' },
    ]);

    // Mock all API calls to prevent background 401→/logout from the fake token.
    await page.route(`${BASE_API}/**`, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, conversationId: 'test-id' }),
    }));

    const help = new HelpPage(page);
    await help.goto();

    // Submit should be disabled initially.
    await expect(help.submitButton).toBeDisabled();

    // Fill message only — still disabled.
    await help.messageTextarea.fill('Test message');
    await expect(help.submitButton).toBeDisabled();

    // Select a topic.
    await page.getByRole('button', { name: /select a topic/i }).click();
    await page.getByRole('button', { name: 'Report an App problem' }).click();

    // Now both topic and message are filled — enabled.
    await expect(help.submitButton).toBeEnabled();
  });

  test('topic list matches mobile verbatim', async ({ page }) => {
    await page.context().addCookies([
      { name: 'accessToken', value: 'fake-token', domain: 'localhost', path: '/' },
    ]);

    await page.route(`${BASE_API}/**`, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, conversationId: 'test-id' }),
    }));

    const help = new HelpPage(page);
    await help.goto();

    await page.getByRole('button', { name: /select a topic/i }).click();

    for (const topic of ['Report an App problem', 'Login/Password', 'Suggestions and ideas', 'Other']) {
      await expect(page.getByRole('button', { name: topic })).toBeVisible();
    }
  });
});

test.describe('S4 — error retry (no auth needed)', () => {
  test('API error shows retry CTA and preserves topic + message', async ({ page }) => {
    await page.context().addCookies([
      { name: 'accessToken', value: 'fake-token', domain: 'localhost', path: '/' },
    ]);

    // Mock all API calls: support/conversations returns 500; everything else returns 200 so the
    // app's 401→/logout interceptor never fires during the test (background Bible API calls
    // would otherwise trigger a logout with the fake token and redirect mid-test).
    await page.route(`${BASE_API}/**`, async route => {
      if (route.request().url().includes('/support/conversations')) {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'internal server error' }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      }
    });

    const help = new HelpPage(page);
    await help.goto();

    await page.getByRole('button', { name: /select a topic/i }).click();
    await page.getByRole('button', { name: 'Other' }).click();
    await help.messageTextarea.fill('My error retry test message');
    await help.submitButton.click();

    // Error state with retry CTA.
    await expect(page.getByText(/something went wrong/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();

    // Topic and message are preserved.
    await expect(help.messageTextarea).toHaveValue('My error retry test message');
    await expect(page.getByText('Other')).toBeVisible();
  });
});

test.describe('S6 — guest sign-in gate (no auth needed)', () => {
  test('unauthenticated user is redirected to /login with returnTo', async ({ page }) => {
    // No cookie set — user is signed out.
    await page.goto('/menu/help');

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/returnTo=.*help/);
  });
});

test.describe('S1 — happy path (requires auth credentials)', () => {
  test.skip(!HAS_AUTH_CREDENTIALS, skipReasonNoAuth);

  test('signed-in submit → success state with "we read every message" copy', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto('/login');
    await login.signIn(TEST_EMAIL, TEST_PASSWORD);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

    const help = new HelpPage(page);
    await help.goto();

    await page.getByRole('button', { name: /select a topic/i }).click();
    await page.getByRole('button', { name: 'Other' }).click();
    await help.messageTextarea.fill('[E2E VER-156] automated happy path — please ignore');
    await help.submitButton.click();

    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/we read every message/i)).toBeVisible();

    // Done button navigates back to menu.
    await page.getByRole('button', { name: /done/i }).click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
