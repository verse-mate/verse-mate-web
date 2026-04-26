import { expect, test } from '@playwright/test';

/**
 * Live diagnosis of the email/password login UI stall reported on
 * production after the cutover. Drives a real browser at
 * https://app.versemate.org and captures cookies, network, console.
 */

const BASE = 'https://app.versemate.org';
const TEST_EMAIL = process.env.VM_TEST_EMAIL || 'apple.review@versemate.org';
const TEST_PASSWORD = process.env.VM_TEST_PASSWORD || 'AppleReview2025$';

test('email/password login: capture flow + post-login state', async ({ page, context }) => {
  test.setTimeout(60_000);

  const consoleMessages: string[] = [];
  const networkErrors: string[] = [];
  const apiCalls: { url: string; method: string; status?: number }[] = [];

  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    consoleMessages.push(`[pageerror] ${err.message}`);
  });
  page.on('requestfailed', (req) => {
    networkErrors.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
  });
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('api.versemate.org')) {
      apiCalls.push({ url, method: resp.request().method(), status: resp.status() });
    }
  });

  console.log('--- 1. Navigate to /login ---');
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  console.log('   url:', page.url());

  console.log('--- 2. Find "Sign in with email" button or email input directly ---');
  // Lovable's SignInScreen has a providers screen first, then email screen.
  // Click the button that switches to email mode if present.
  const emailModeBtn = page.getByRole('button', { name: /email|continue with email/i }).first();
  if (await emailModeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailModeBtn.click();
    console.log('   clicked "email" button');
  } else {
    console.log('   no email-mode button visible; assuming form is already shown');
  }

  console.log('--- 3. Fill email + password ---');
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10_000 });
  await emailInput.fill(TEST_EMAIL);
  await passwordInput.fill(TEST_PASSWORD);

  console.log('--- 4. Submit form ---');
  // Find the submit button — usually the last visible button on the page,
  // labeled with "Sign in" / "Continue" / "Log in"
  const submitBtn = page.getByRole('button', { name: /sign in|log in|continue/i }).last();
  await submitBtn.click();

  console.log('--- 5. Wait 8s for post-submit state to settle ---');
  await page.waitForTimeout(8000);

  console.log('--- 6. Capture cookies ---');
  const cookies = await context.cookies();
  const accessCookie = cookies.find((c) => c.name === 'accessToken');
  const refreshCookie = cookies.find((c) => c.name === 'refreshToken');
  console.log('   accessToken cookie:', !!accessCookie, accessCookie ? `(len=${accessCookie.value.length})` : '');
  console.log('   refreshToken cookie:', !!refreshCookie, refreshCookie ? `(len=${refreshCookie.value.length})` : '');

  console.log('--- 7. Capture URL + visible body text ---');
  console.log('   url:', page.url());
  const bodyText = (await page.locator('body').innerText()).slice(0, 500);
  console.log('   body (first 500 chars):', JSON.stringify(bodyText));

  console.log('--- 8. API calls during the flow ---');
  for (const call of apiCalls) {
    console.log(`   ${call.method} ${call.url} → ${call.status}`);
  }

  console.log('--- 9. Console messages ---');
  for (const msg of consoleMessages.slice(-30)) {
    console.log('  ', msg);
  }

  console.log('--- 10. Network errors ---');
  for (const err of networkErrors) {
    console.log('  ', err);
  }

  console.log('--- 11. Navigate to /menu (where user reported profile pic loading stuck) ---');
  apiCalls.length = 0; // clear so we only see /menu requests
  await page.goto(`${BASE}/menu`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('   url:', page.url());
  const menuBody = (await page.locator('body').innerText()).slice(0, 800);
  console.log('   menu body:', JSON.stringify(menuBody));

  console.log('--- 12. /menu API calls ---');
  for (const call of apiCalls) {
    console.log(`   ${call.method} ${call.url} → ${call.status}`);
  }

  console.log('--- 13. Profile image elements ---');
  const imgs = await page.locator('img').all();
  for (const img of imgs.slice(0, 5)) {
    const src = await img.getAttribute('src');
    const naturalWidth = await img.evaluate((e: HTMLImageElement) => e.naturalWidth).catch(() => 0);
    const complete = await img.evaluate((e: HTMLImageElement) => e.complete).catch(() => false);
    console.log(`   img src="${src?.slice(0, 100)}" complete=${complete} naturalWidth=${naturalWidth}`);
  }

  console.log('--- 14. /auth/user response payload (what does the user object actually contain?) ---');
  const userJson = await page.evaluate(async () => {
    const r = await fetch('https://api.versemate.org/auth/user', {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${document.cookie.match(/accessToken=([^;]+)/)?.[1] || ''}`,
      },
    });
    return { status: r.status, body: await r.text() };
  });
  console.log('   status:', userJson.status);
  console.log('   body:', userJson.body.slice(0, 600));
});
