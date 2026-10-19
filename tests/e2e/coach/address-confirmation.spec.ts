import { expect, type Page, test } from '@playwright/test';

import { type AddressRequest, capture, FAILED_SEND_LEADER, useCoachApi } from './fixtures';

const CAROL = 'uncovered';

function request(over: Partial<AddressRequest>): AddressRequest {
  return {
    token: 'token-pending',
    coachId: CAROL,
    newEmail: 'carol.new@example.test',
    state: 'pending',
    reason: null,
    requestedAt: '2026-10-09T14:00:00.000Z',
    expiresAt: '2026-10-16T14:00:00.000Z',
    ...over,
  };
}

async function openPipeline(page: Page) {
  await page.goto('/coach');
  await page.getByTestId('oversight-nav-pipeline').click();
  await expect(page.getByTestId('coach-coverage-summary')).toBeVisible();
}

test.describe('The address confirmation page', () => {
  test('a reload, and a trip away and back, keep the token the address bar no longer shows', async ({ page }) => {
    const calls: string[] = [];
    await useCoachApi(page, { signedOut: true, addressRequests: [request({})], onConfirmAddress: (m) => calls.push(m) });

    await page.goto('/coach/confirm-address#token=token-pending');
    await expect(page.getByTestId('coach-confirm-address-pending')).toContainText('Carol Chen');
    await expect(page).toHaveURL(/\/coach\/confirm-address$/);

    await page.reload();
    await expect(page.getByTestId('coach-confirm-address-pending')).toContainText('Carol Chen');
    await expect(page).toHaveURL(/\/coach\/confirm-address$/);

    await page.goto('about:blank');
    await page.goBack();
    await expect(page.getByTestId('coach-confirm-address-pending')).toContainText('Carol Chen');
    await page.goForward();
    await expect(page).toHaveURL('about:blank');
    await page.goBack();
    await expect(page.getByTestId('coach-confirm-address-pending')).toContainText('Carol Chen');
    await page.waitForLoadState('networkidle');
    expect(calls.filter((c) => c === 'confirm')).toEqual([]);

    await page.getByTestId('coach-confirm-address-submit').click();
    await expect(page.getByTestId('coach-confirm-address-confirmed')).toContainText("Carol Chen's coaching reports now go to c***@example.test.");
    expect(calls.filter((c) => c === 'confirm')).toEqual(['confirm']);
  });

  test('a link already sent with the token in its query still opens, and loses the token from the address bar', async ({ page }) => {
    const calls: string[] = [];
    await useCoachApi(page, { signedOut: true, addressRequests: [request({})], onConfirmAddress: (m) => calls.push(m) });

    await page.goto('/coach/confirm-address?token=token-pending');
    await expect(page.getByTestId('coach-confirm-address-pending')).toContainText('Carol Chen');
    await expect(page).toHaveURL(/\/coach\/confirm-address$/);
    await page.reload();
    await expect(page.getByTestId('coach-confirm-address-pending')).toContainText('Carol Chen');
    expect(calls).not.toContain('confirm');
  });

  test('opening the link sends no confirmation and takes the token out of the address bar; the Confirm button confirms, once', async ({ page }, testInfo) => {
    const calls: string[] = [];
    await useCoachApi(page, { signedOut: true, addressRequests: [request({})], onConfirmAddress: (m) => calls.push(m) });

    await page.goto('/coach/confirm-address#token=token-pending');
    const pending = page.getByTestId('coach-confirm-address-pending');
    await expect(pending).toContainText('Carol Chen');
    await expect(pending).toContainText('to go to c***@example.test.');
    await expect(pending).not.toContainText('instead of');
    await expect(pending).toContainText('Nothing changes until you confirm');
    await expect(pending).toContainText('Oct 16, 2026');
    await expect(page).toHaveURL(/\/coach\/confirm-address$/);
    await page.waitForLoadState('networkidle');
    expect(calls).toEqual(['describe']);
    await capture(page, testInfo, 'confirm-address-pending');

    await page.getByTestId('coach-confirm-address-submit').click();
    await expect(page.getByTestId('coach-confirm-address-confirmed')).toContainText(
      "Confirmed. Carol Chen's coaching reports now go to c***@example.test.",
    );
    expect(calls).toEqual(['describe', 'confirm']);
    await capture(page, testInfo, 'confirm-address-confirmed');
  });

  for (const [state, words] of [
    ['expired', 'This link expired on Oct 16, 2026, so the address was not changed.'],
    ['superseded', 'A newer address change replaced this one'],
    ['confirmed', 'This change is already confirmed, so this link no longer works.'],
    ['refused', 'another leader already uses that address'],
  ] as const) {
    test(`a ${state} change says so in words, names no one and offers no confirm`, async ({ page }, testInfo) => {
      const calls: string[] = [];
      await useCoachApi(page, { signedOut: true, addressRequests: [request({ state })], onConfirmAddress: (m) => calls.push(m) });

      await page.goto('/coach/confirm-address?token=token-pending');
      const shown = page.getByTestId(`coach-confirm-address-${state}`);
      await expect(shown).toContainText(words);
      await expect(page.getByTestId('coach-confirm-address')).not.toContainText('Carol');
      await expect(page.getByTestId('coach-confirm-address')).not.toContainText('@');
      await expect(page.getByTestId('coach-confirm-address-submit')).toHaveCount(0);
      await expect(page).toHaveURL(/\/coach\/confirm-address$/);
      expect(calls).toEqual(['describe']);
      await capture(page, testInfo, `confirm-address-opened-${state}`);
    });
  }

  test('an unknown link is not valid', async ({ page }, testInfo) => {
    await useCoachApi(page, { signedOut: true });
    await page.goto('/coach/confirm-address?token=no-such-token');
    await expect(page.getByTestId('coach-confirm-address-invalid')).toContainText('This confirmation link is not valid.');
    await capture(page, testInfo, 'confirm-address-invalid');
  });

  test('a change taken by another leader before it confirms is refused on confirm', async ({ page }, testInfo) => {
    await useCoachApi(page, { signedOut: true, addressRequests: [request({ newEmail: 'leader@example.test' })] });
    await page.goto('/coach/confirm-address?token=token-pending');
    await page.getByTestId('coach-confirm-address-submit').click();
    await expect(page.getByTestId('coach-confirm-address-refused')).toContainText('another leader already uses that address');
    await capture(page, testInfo, 'confirm-address-taken-on-confirm');
  });
});

test.describe("An admin's change to a leader's address", () => {
  test('is shown as awaiting confirmation until the new address confirms it', async ({ page }, testInfo) => {
    const tokens: string[] = [];
    await useCoachApi(page, { admin: true, failedSends: true, onAddressRequest: (t) => tokens.push(t) });
    await openPipeline(page);

    const row = page.getByTestId(`coach-coverage-${FAILED_SEND_LEADER.id}`);
    await row.getByTestId(`coach-address-edit-${FAILED_SEND_LEADER.id}`).click();
    await row.getByTestId(`coach-address-input-${FAILED_SEND_LEADER.id}`).fill('carol.new@example.test');
    await row.getByTestId(`coach-address-save-${FAILED_SEND_LEADER.id}`).click();
    await expect(page.getByText('A confirmation link went to the new address.', { exact: false })).toBeVisible();
    await expect(row.getByTestId(`coach-address-${FAILED_SEND_LEADER.id}`)).toHaveText(FAILED_SEND_LEADER.email);
    await expect(row.getByTestId(`coach-address-change-${FAILED_SEND_LEADER.id}`)).toHaveText(
      'Awaiting confirmation: carol.new@example.test, requested Oct 9, 2026, link expires Oct 16, 2026',
    );
    await capture(page, testInfo, 'admin-address-pending', row);

    await page.goto(`/coach/confirm-address#token=${tokens[0]}`);
    await page.getByTestId('coach-confirm-address-submit').click();
    await expect(page.getByTestId('coach-confirm-address-confirmed')).toBeVisible();

    await openPipeline(page);
    const after = page.getByTestId(`coach-coverage-${FAILED_SEND_LEADER.id}`);
    await expect(after.getByTestId(`coach-address-${FAILED_SEND_LEADER.id}`)).toHaveText('carol.new@example.test');
    await expect(after.getByTestId(`coach-address-change-${FAILED_SEND_LEADER.id}`)).toHaveCount(0);
    await capture(page, testInfo, 'admin-address-confirmed', after);
  });

  test('that expired or was refused is shown with why', async ({ page }, testInfo) => {
    await useCoachApi(page, {
      admin: true,
      failedSends: true,
      addressRequests: [
        request({ token: 'a', state: 'expired' }),
        request({ token: 'b', coachId: 'leader', newEmail: 'taken@example.test', state: 'refused', reason: 'taken' }),
      ],
    });
    await openPipeline(page);

    await expect(page.getByTestId(`coach-coverage-${FAILED_SEND_LEADER.id}`).getByTestId(`coach-address-change-${FAILED_SEND_LEADER.id}`)).toHaveText(
      'Not confirmed: the link to carol.new@example.test, requested Oct 9, 2026, expired Oct 16, 2026. Change the address again to send a new one.',
    );
    await expect(page.getByTestId('coach-coverage-leader').getByTestId('coach-address-change-leader')).toHaveText(
      'Not changed: taken@example.test, requested Oct 9, 2026, was refused when it confirmed, because another leader already uses it.',
    );
    await capture(page, testInfo, 'admin-address-expired-refused', page.getByTestId('coach-coverage-summary'));
  });
});
