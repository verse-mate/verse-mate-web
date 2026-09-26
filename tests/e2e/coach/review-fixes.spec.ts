import { join } from 'node:path';

import { expect, type Page, type TestInfo, test } from '@playwright/test';

import { LEADER_ID, NEWEST_ID, OLDER_ID, useCoachApi } from './fixtures';

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const dir = process.env.E2E_CAPTURE_DIR;
  if (!dir) return;
  await page.screenshot({ path: join(dir, `${name}-${testInfo.project.name}.png`), fullPage: true });
}

test.describe('A dimension rating', () => {
  test('uses the served band name, so a 4 reads Strong everywhere', async ({ page }, testInfo) => {
    await useCoachApi(page);
    await page.goto('/coach');

    await page.getByTestId('coach-tab-scorecard').click();
    const row = page.getByTestId('coach-dim-1');
    await expect(row).toContainText('4/5');
    await expect(row.getByText('Strong', { exact: true })).toBeVisible();
    await expect(row).not.toContainText(/on target/i);
    await capture(page, testInfo, 'item1-dimension-rating');
  });
});

test.describe('The cluster trend chart', () => {
  test('never draws a phantom dateLabel cluster before the rubric resolves', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'the chart renders on the desktop layout');
    let rubricServed = false;
    page.on('response', (r) => {
      if (r.url().endsWith('/coach/rubric')) rubricServed = true;
    });
    await useCoachApi(page, { admin: true, rubricDelayMs: 20_000 });
    await page.goto(`/coach/leader/${LEADER_ID}/manage`);

    const card = page.getByTestId('coach-trend-cluster');
    await expect(card.getByText('Being Real')).toBeVisible();
    const legend = await card.locator('div > span').allTextContents();
    expect(rubricServed).toBe(false);
    expect(legend).toEqual(['Teaching Craft', 'Building Ministry', 'Engaging People', 'Being Real']);
    await capture(page, testInfo, 'item4-cluster-chart-before-rubric');
  });
});

test.describe('A recording minted for one session', () => {
  test('never plays in the session opened while the mint was in flight', async ({
    page,
  }, testInfo) => {
    await useCoachApi(page, { retained: [NEWEST_ID, OLDER_ID], mintDelayMs: 2000 });
    await page.goto('/coach');
    await expect(page.getByTestId(`coach-recording-play-${NEWEST_ID}`)).toBeVisible();
    await page.getByTestId('coach-nav-sessions').first().click();
    await page.getByTestId('coach-view-report').nth(1).click();
    await expect(page.getByTestId(`coach-recording-play-${OLDER_ID}`)).toBeVisible();

    const olderMint = page.waitForResponse((r) => r.url().includes(`${OLDER_ID}/recording-url`));
    await page.getByTestId(`coach-recording-play-${OLDER_ID}`).click();
    await expect(page.getByText('Opening the recording…')).toBeVisible();
    await page.getByRole('button', { name: /back to the most recent session/i }).click();
    await expect(page.getByText('MOST RECENT SESSION')).toBeVisible();

    await olderMint;
    await page.waitForTimeout(750);
    expect(await page.locator('video').evaluateAll((els) => els.map((v) => (v as HTMLVideoElement).src))).toEqual([]);
    await expect(page.getByTestId(`coach-recording-play-${NEWEST_ID}`)).toHaveText('Play the recording');
    await capture(page, testInfo, 'item5-stale-mint-dropped');
  });
});
