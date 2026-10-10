import { expect, test, type Page } from '@playwright/test';

import { API, capture, refuse, serve, useCoachApi } from './fixtures';

async function account(page: Page, opts: { emailVerified: boolean; verify?: { status: number; json: unknown } }) {
  const calls: Array<{ path: string; body: unknown }> = [];
  await serve(page, `${API}/coach/me`, (route) => route.fulfill({ status: 403, json: { error: 'FORBIDDEN', message: 'Not a coaching account' } }));
  await page.route(`${API}/user/me`, (route) =>
    route.fulfill({ json: { id: 'u1', email: 'leader@example.test', firstName: 'Avery', lastName: 'Hollis', emailVerified: opts.emailVerified } }),
  );
  await page.route(`${API}/auth/send-email-verification`, (route) => {
    calls.push({ path: '/auth/send-email-verification', body: null });
    return route.fulfill({ status: 204 });
  });
  await page.route(`${API}/auth/verify-email`, (route) => {
    calls.push({ path: '/auth/verify-email', body: route.request().postDataJSON() });
    const answer = opts.verify ?? { status: 200, json: { accessToken: 'e2e-token-2', refreshToken: 'e2e-refresh-2' } };
    return route.fulfill(answer);
  });
  return calls;
}

test.describe('Leader-facing email verification (10.3)', () => {
  test('A leader whose email is not confirmed is asked to confirm it, not told they are not a coach', async ({ page }, testInfo) => {
    await useCoachApi(page);
    const calls = await account(page, { emailVerified: false });
    await page.goto('/coach/upload');
    await expect(page.getByTestId('coach-confirm-email')).toBeVisible();
    await expect(page.getByTestId('coach-not-a-coach')).toHaveCount(0);
    await capture(page, testInfo, 'v1-confirm-email-gate');
    await page.getByTestId('coach-confirm-email-send').click();
    await expect(page.getByTestId('coach-confirm-email-sent')).toContainText('Check your inbox');
    expect(calls).toEqual([{ path: '/auth/send-email-verification', body: null }]);
  });

  test('An account confirmed before the identity change is asked to confirm again, as the server says', async ({ page }) => {
    await useCoachApi(page);
    await account(page, { emailVerified: true });
    await serve(page, `${API}/coach/me`, (route) => refuse(route, 'confirm-email'));
    await page.goto('/coach/upload');
    await expect(page.getByTestId('coach-confirm-email')).toBeVisible();
    await expect(page.getByTestId('coach-not-a-coach')).toHaveCount(0);
  });

  test('The dashboard gate asks too', async ({ page }) => {
    await useCoachApi(page);
    await account(page, { emailVerified: false });
    await page.goto('/coach');
    await expect(page.getByTestId('coach-confirm-email')).toBeVisible();
  });

  test('A confirmed account that is not on the roster is still told it is not a coaching account', async ({ page }) => {
    await useCoachApi(page);
    await account(page, { emailVerified: true });
    await page.goto('/coach/upload');
    await expect(page.getByTestId('coach-not-a-coach')).toBeVisible();
    await expect(page.getByTestId('coach-confirm-email')).toHaveCount(0);
  });

  test('The link in the email confirms the address and leads to the coaching reports', async ({ page }, testInfo) => {
    await useCoachApi(page);
    const calls = await account(page, { emailVerified: false });
    await page.goto('/email-verified?key=k-123');
    await expect(page.getByTestId('email-verified')).toHaveAttribute('data-outcome', 'confirmed');
    await expect(page.getByTestId('email-verified-coach-link')).toHaveAttribute('href', '/coach');
    expect(calls).toEqual([{ path: '/auth/verify-email', body: { token: 'k-123' } }]);
    await capture(page, testInfo, 'v2-email-confirmed');
  });

  test('An expired link offers a new one', async ({ page }, testInfo) => {
    await useCoachApi(page);
    const calls = await account(page, { emailVerified: false, verify: { status: 400, json: { error: 'VALIDATION_ERROR', message: 'Invalid verification token' } } });
    await page.goto('/email-verified?key=old');
    await expect(page.getByTestId('email-verified')).toHaveAttribute('data-outcome', 'invalid');
    await page.getByTestId('email-verified-resend').click();
    await expect(page.getByTestId('email-verified-resent')).toBeVisible();
    expect(calls.map((c) => c.path)).toEqual(['/auth/verify-email', '/auth/send-email-verification']);
    await capture(page, testInfo, 'v3-email-link-expired');
  });

  test('A signed-out visitor is asked to sign in first, and comes back to the link', async ({ page }) => {
    await useCoachApi(page, { signedOut: true });
    const calls = await account(page, { emailVerified: false });
    await page.goto('/email-verified?key=k-9');
    await expect(page.getByTestId('email-verified')).toHaveAttribute('data-outcome', 'signed-out');
    expect(await page.evaluate(() => localStorage.getItem('redirectTo'))).toBe('/email-verified?key=k-9');
    expect(calls).toEqual([]);
  });
});
