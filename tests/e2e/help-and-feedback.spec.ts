import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { AboutPage } from './pages/about.page';
import { HelpPage } from './pages/help.page';
import { TEST_EMAIL, TEST_PASSWORD, HAS_AUTH_CREDENTIALS, skipReasonNoAuth } from './fixtures/env';

/**
 * E2E smoke — support pipeline (VER-158).
 *
 * Covers the full authenticated user journey:
 *   Sign in → About → Contact link → Help form → Submit → success state
 *
 * Requires staging credentials (E2E_TEST_EMAIL / E2E_TEST_PASSWORD).
 * Manual Slack confirmation of a received submission is required before
 * this test can gate R1 mitigation.
 *
 * NOTE: The staging deployment (Cloudflare CDN) redirects all sub-paths
 * (e.g. /menu/about, /menu/help) back to / via HTTP 307. All navigation
 * must therefore go through the SPA (in-app link/button clicks) rather
 * than direct page.goto() to those paths. Only the root / is loaded directly.
 */

/** Locate the hamburger/open-menu button regardless of whether the build has the testid. */
function menuTriggerButton(page: Parameters<typeof LoginPage>[0]['page']) {
  return page.getByTestId('hamburger-menu-button').or(
    page.getByRole('button', { name: /open menu/i })
  ).first();
}

/**
 * Open the hamburger menu from the reader. Waits for a reliable menu item to appear
 * rather than the `hamburger-menu` testid (absent on some staging builds).
 */
async function openMenu(page: Parameters<typeof LoginPage>[0]['page']) {
  await menuTriggerButton(page).click();
  // Wait for the menu to render. The staging build may lack testids, so fall back to
  // the visible "Help" text which is always present in the menu.
  await page.getByTestId('menu-item-help')
    .or(page.getByRole('button', { name: /^help$/i }))
    .waitFor({ state: 'visible', timeout: 10_000 });
}

/**
 * Ensure the current Playwright context is signed in.
 *
 * Strategy:
 *  1. Navigate to / (only path that is 200 on staging; others 307 → /).
 *  2. Open the hamburger menu.
 *  3. If `menu-item-login` (Sign In) is visible, the user is a guest → sign in.
 *  4. If `menu-item-logout` (Sign Out) is visible, already signed in → close menu.
 */
async function ensureSignedIn(page: Parameters<typeof LoginPage>[0]['page'], email: string, password: string) {
  await page.goto('/');
  await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});

  await openMenu(page);

  const loginItem = page.getByTestId('menu-item-login')
    .or(page.getByRole('button', { name: /^sign in$/i }));
  const logoutItem = page.getByTestId('menu-item-logout')
    .or(page.getByRole('button', { name: /^sign out$/i }));

  const isGuest = await loginItem.isVisible({ timeout: 2_000 }).catch(() => false);
  const isSignedIn = !isGuest && (await logoutItem.isVisible({ timeout: 2_000 }).catch(() => false));

  if (isSignedIn) {
    // Close the menu and proceed
    const closeButton = page.getByRole('button', { name: /close|✕|×/i }).or(
      page.getByTestId('menu-close-button')
    );
    if (await closeButton.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await closeButton.click();
    }
    return;
  }

  // Click "Sign In" from within the menu, then wait for the SPA to render the sign-in panel.
  await loginItem.click();
  await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});

  // Providers screen → Continue with Email (testid absent on older staging builds)
  await page.getByTestId('login-email-button')
    .or(page.getByRole('button', { name: /continue with email/i }))
    .click();

  // Email/password form
  await page.getByTestId('login-email')
    .or(page.locator('input[type="email"]'))
    .or(page.getByPlaceholder(/example\.com/i))
    .fill(email);
  await page.getByTestId('login-password')
    .or(page.locator('input[type="password"]'))
    .fill(password);
  await page.getByTestId('login-submit')
    .or(page.getByRole('button', { name: /^sign in$/i }))
    .click();

  // Wait for sign-in success — app navigates to /menu after login; Sign Out is visible there
  await page.getByTestId('menu-item-logout')
    .or(page.getByRole('button', { name: /^logout$|^sign out$/i }))
    .waitFor({ state: 'visible', timeout: 15_000 });
}

async function selectFirstTopic(page: Parameters<typeof LoginPage>[0]['page']) {
  await page.getByRole('button', { name: /select a topic/i }).click();
  // "Report an App problem" is the first topic option in HelpScreen.tsx
  const firstTopic = page.locator('button', { hasText: /report an app problem/i });
  await firstTopic.waitFor({ state: 'visible' });
  await firstTopic.click();
}

test.describe('Support pipeline — help & feedback (authenticated)', () => {
  test.skip(!HAS_AUTH_CREDENTIALS, skipReasonNoAuth);

  test('About → Contact link navigates to Help screen', async ({ page }) => {
    const about = new AboutPage(page);
    const help = new HelpPage(page);

    await ensureSignedIn(page, TEST_EMAIL, TEST_PASSWORD);
    await openMenu(page);

    // Navigate to About via menu item
    await page.getByTestId('menu-item-about')
      .or(page.getByRole('button', { name: /^about$/i }))
      .click();
    await about.contactLink.waitFor({ state: 'visible' });

    // T3: Contact link must be an in-app router link to /menu/help, not mailto:
    await about.contactLink.click();

    // SPA navigation: no server round-trip, URL changes to /menu/help
    await expect(page).toHaveURL(/\/menu\/help/, { timeout: 10_000 });
    await expect(help.heading).toBeVisible();
  });

  test('submit help form → success state', async ({ page }) => {
    const help = new HelpPage(page);

    await ensureSignedIn(page, TEST_EMAIL, TEST_PASSWORD);
    await openMenu(page);

    // Navigate to Help via menu item
    await page.getByTestId('menu-item-help')
      .or(page.getByRole('button', { name: /^help$/i }))
      .click();
    await expect(help.heading).toBeVisible({ timeout: 10_000 });

    await selectFirstTopic(page);
    await help.messageTextarea.fill(
      '[E2E automated test] VER-158 smoke submission — please ignore.',
    );

    // Submit button is labelled "Send"
    await page.getByRole('button', { name: /^send$/i }).click();

    // T2: real backend call — allow up to 20 s for the network round-trip
    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/thanks for reaching out/i)).toBeVisible();
  });

  test('success state shows "Done" button that returns to /menu', async ({ page }) => {
    const help = new HelpPage(page);

    await ensureSignedIn(page, TEST_EMAIL, TEST_PASSWORD);
    await openMenu(page);

    await page.getByTestId('menu-item-help')
      .or(page.getByRole('button', { name: /^help$/i }))
      .click();
    await expect(help.heading).toBeVisible({ timeout: 10_000 });

    await selectFirstTopic(page);
    await help.messageTextarea.fill('[E2E automated test] VER-158 back-nav check — please ignore.');
    await page.getByRole('button', { name: /^send$/i }).click();

    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 20_000 });

    // After success the Send button is replaced by "Done"
    const doneButton = page.getByRole('button', { name: /^done$/i });
    await expect(doneButton).toBeVisible();
    await doneButton.click();
    await expect(page).toHaveURL(/\/menu(?:\/|$)/);
  });
});
