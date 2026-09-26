import { join } from 'node:path';

import { expect, type Page, type TestInfo, test } from '@playwright/test';

import { useCoachApi } from './fixtures';

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
