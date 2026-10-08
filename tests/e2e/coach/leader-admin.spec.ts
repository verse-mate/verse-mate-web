import { expect, test } from '@playwright/test';

import {
  API,
  capture,
  LEADER_ID,
  olderId,
  PLACEHOLDER_LEADER,
  SKIPPED_SESSION,
  UNRESOLVED_SESSION,
  useCoachApi,
} from './fixtures';

const REPLAY_BLOCKED = '.ph-no-capture';

async function openPipeline(page: import('@playwright/test').Page) {
  await page.goto('/coach');
  await page.getByTestId('oversight-nav-pipeline').click();
  await expect(page.getByTestId('coach-coverage-summary')).toBeVisible();
}

test.describe("A leader's address", () => {
  test('a placeholder reads as no real address yet, and an admin sets the real one', async ({ page }, testInfo) => {
    const writes: string[] = [];
    await useCoachApi(page, { admin: true, leaderAdmin: true, onAdminWrite: (m, p) => writes.push(`${m} ${p}`) });
    await openPipeline(page);

    const row = page.getByTestId(`coach-coverage-${PLACEHOLDER_LEADER.id}`);
    await expect(row.getByTestId(`coach-address-${PLACEHOLDER_LEADER.id}`)).toHaveText('No real address yet');
    await expect(row).not.toContainText('needs-real-email');
    await expect(page.getByTestId('coach-address-uncovered').locator(`xpath=ancestor-or-self::*[contains(@class,"ph-no-capture")]`)).toHaveCount(1);
    await capture(page, testInfo, 'w2a-address-placeholder', row);

    await row.getByTestId(`coach-address-edit-${PLACEHOLDER_LEADER.id}`).click();
    await row.getByTestId(`coach-address-input-${PLACEHOLDER_LEADER.id}`).fill('carol@example.test');
    await row.getByTestId(`coach-address-save-${PLACEHOLDER_LEADER.id}`).click();
    await expect(row.getByTestId(`coach-address-error-${PLACEHOLDER_LEADER.id}`)).toContainText(
      'Another leader already uses that address',
    );
    await capture(page, testInfo, 'w2a-address-taken', row);

    await row.getByTestId(`coach-address-input-${PLACEHOLDER_LEADER.id}`).fill('dana@example.test');
    await row.getByTestId(`coach-address-save-${PLACEHOLDER_LEADER.id}`).click();
    await expect(row.getByTestId(`coach-address-${PLACEHOLDER_LEADER.id}`)).toHaveText('dana@example.test');
    await expect(page.getByTestId(`coach-pipeline-${SKIPPED_SESSION.sourceSessionId}`)).toHaveCount(0);
    expect(writes).toContain(`PUT /coach/admin/leaders/${PLACEHOLDER_LEADER.id}/email`);
    await capture(page, testInfo, 'w2a-address-saved', row);
  });
});

test.describe("A leader's title keywords and alternate addresses", () => {
  test('load the current lists, refuse a short keyword, and a saved keyword resolves a session', async ({ page }, testInfo) => {
    const writes: Array<[string, unknown]> = [];
    await useCoachApi(page, { admin: true, leaderAdmin: true, onAdminWrite: (_m, p, b) => writes.push([p, b]) });
    await openPipeline(page);

    const row = page.getByTestId('coach-coverage-evan-ellis');
    await row.getByTestId('coach-attribution-edit-evan-ellis').click();
    const keywords = row.getByTestId('coach-attribution-keywords-evan-ellis');
    await expect(keywords).toHaveValue('tuesday night');
    await expect(row.getByTestId('coach-attribution-emails-evan-ellis')).toHaveValue('evan.personal@example.test');
    await expect(keywords.locator('xpath=ancestor::*[contains(@class,"ph-no-capture")]')).toHaveCount(1);

    await keywords.fill('tuesday night\nhb');
    await expect(row.getByTestId('coach-attribution-error-evan-ellis')).toContainText('at least three characters: hb');
    await expect(row.getByTestId('coach-attribution-save-evan-ellis')).toBeDisabled();
    await capture(page, testInfo, 'w2b-attribution-short-keyword', row);

    await row.getByTestId('coach-attribution-emails-evan-ellis').fill('evan.personal@example.test\nnot-an-address');
    await keywords.fill('tuesday night\nHabakkuk study');
    await row.getByTestId('coach-attribution-save-evan-ellis').click();
    await expect(row.getByTestId('coach-attribution-error-evan-ellis')).toContainText(
      'Refused (400): Each alternate address must be a valid email address',
    );

    await row.getByTestId('coach-attribution-emails-evan-ellis').fill('evan.personal@example.test');
    await row.getByTestId('coach-attribution-save-evan-ellis').click();
    await expect(row.getByTestId('coach-attribution-saved-evan-ellis')).toHaveText('Saved. 1 unattributed session now matches a leader.');
    await expect(page.getByTestId(`coach-pipeline-${UNRESOLVED_SESSION.sourceSessionId}`)).toHaveCount(0);
    expect(writes.at(-1)).toEqual([
      '/coach/admin/leaders/evan-ellis/attribution',
      { titleMatch: ['tuesday night', 'Habakkuk study'], altEmails: ['evan.personal@example.test'] },
    ]);
    await capture(page, testInfo, 'w2b-attribution-saved', row);
  });
});

test.describe('The failures list', () => {
  test('assigns an unresolved session to a leader from the roster', async ({ page }, testInfo) => {
    const writes: Array<[string, unknown]> = [];
    await useCoachApi(page, { admin: true, leaderAdmin: true, onAdminWrite: (_m, p, b) => writes.push([p, b]) });
    await openPipeline(page);

    const row = page.getByTestId(`coach-pipeline-${UNRESOLVED_SESSION.sourceSessionId}`);
    await expect(row).toContainText('unattributed');
    await expect(row.getByTestId(`coach-pipeline-requeue-${UNRESOLVED_SESSION.sourceSessionId}`)).toHaveCount(0);
    await expect(row.getByTestId(`coach-pipeline-assign-${UNRESOLVED_SESSION.sourceSessionId}`)).toBeDisabled();
    await row.getByTestId(`coach-pipeline-assign-to-${UNRESOLVED_SESSION.sourceSessionId}`).selectOption('evan-ellis');
    await capture(page, testInfo, 'w2a-assign-picked', row);

    await row.getByTestId(`coach-pipeline-assign-${UNRESOLVED_SESSION.sourceSessionId}`).click();
    await expect(row).toHaveCount(0);
    expect(writes).toContainEqual([
      `/coach/admin/sessions/${UNRESOLVED_SESSION.sourceSessionId}/attribute`,
      { coachId: 'evan-ellis' },
    ]);
  });

  test('a send skipped for a placeholder names the leader and offers the address fix', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, leaderAdmin: true });
    await openPipeline(page);

    const row = page.getByTestId(`coach-pipeline-${SKIPPED_SESSION.sourceSessionId}`);
    await expect(row).toContainText(PLACEHOLDER_LEADER.name);
    await expect(row.locator(REPLAY_BLOCKED).filter({ hasText: 'placeholder address' })).toHaveCount(1);
    await expect(row.getByTestId(`coach-address-edit-${PLACEHOLDER_LEADER.id}`)).toBeVisible();
    await expect(row.getByRole('button', { name: /release|queue/i })).toHaveCount(0);
    await capture(page, testInfo, 'w2a-skipped-placeholder', row);
  });
});

test.describe('Coverage', () => {
  test('tells attested from not observed, and an admin marks and clears not teaching', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, leaderAdmin: true });
    await openPipeline(page);

    await expect(page.getByTestId('coach-coverage-basis-evan-ellis')).toHaveText('Not teaching (attested)');
    await expect(page.getByTestId('coach-coverage-attested-evan-ellis')).toContainText('admin@example.test');
    await expect(page.getByTestId('coach-coverage-basis-uncovered')).toHaveText('Not covered · Not observed');
    await capture(page, testInfo, 'w2a-coverage-states', page.getByTestId('coach-coverage-evan-ellis'));

    await page.getByTestId('coach-coverage-not-teaching-uncovered').click();
    await expect(page.getByTestId('coach-coverage-basis-uncovered')).toHaveText('Not teaching (attested)');
    await expect(page.getByTestId('coach-coverage-not-teaching-uncovered')).toHaveText('Clear not teaching');
    await capture(page, testInfo, 'w2a-coverage-attested', page.getByTestId('coach-coverage-uncovered'));

    await page.getByTestId('coach-coverage-not-teaching-uncovered').click();
    await expect(page.getByTestId('coach-coverage-basis-uncovered')).toHaveText('Not covered · Not observed');
  });
});

test.describe('Adding a leader', () => {
  test('a taken id is refused in the form, and a new leader opens by the returned id', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, leaderAdmin: true });
    await page.goto('/coach');
    await page.getByTestId('oversight-add-leader').click();
    await page.getByTestId('oversight-invite-name').fill('Avery Hollis');
    await page.getByTestId('oversight-invite-email').fill('bryan2@example.test');
    await page.getByTestId('oversight-invite-send').click();

    await expect(page.getByTestId('oversight-invite-error')).toContainText('Another leader already uses the id "avery-hollis"');
    await capture(page, testInfo, 'w2a-add-leader-taken', page.getByTestId('oversight-invite-modal'));

    const summaries: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/reports/summary')) summaries.push(new URL(r.url()).pathname);
    });
    await page.getByTestId('oversight-invite-name').fill('Faith Ford');
    await page.getByTestId('oversight-invite-send').click();
    await expect(page.getByTestId('oversight-invite-modal')).toHaveCount(0);
    await expect(page.getByTestId('oversight-back')).toBeVisible();
    await expect.poll(() => summaries).toContain('/coach/admin/coaches/faith-ford/reports/summary');
    await capture(page, testInfo, 'w2a-add-leader-opened');
  });
});

test.describe("A leader's history on the admin screens", () => {
  test('a failed next page on the drill-in keeps the page and retries', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, historyLength: 60 });
    let failNext = true;
    await page.route(/\/coach\/admin\/coaches\/[^/]+\/reports\/summary\?.*offset=50/, (route) => {
      if (!failNext) return route.fallback();
      failNext = false;
      return route.fulfill({ status: 500, json: { error: 'INTERNAL', message: 'database unavailable' } });
    });
    await page.goto('/coach');
    await page.getByTestId(`oversight-roster-${LEADER_ID}`).click();
    await expect(page.getByText(/Page 1 of 13/)).toBeVisible();
    for (let i = 0; i < 10; i++) await page.getByRole('button', { name: 'Older →' }).click();

    await expect(page.getByText('Could not load these classes.')).toBeVisible();
    await expect(page.getByText('Development · the coaching conversation')).toBeVisible();
    await capture(page, testInfo, 'w2a-drill-in-page-failed', page.getByTestId('oversight-classes-retry'));

    await page.getByTestId('oversight-classes-retry').click();
    await expect(page.getByTestId(`oversight-class-${olderId(48)}`)).toBeVisible();
  });

  test('a trend point opens a session that is not on a loaded page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'the trend charts render on the desktop layout');
    await useCoachApi(page, { admin: true, historyLength: 60 });
    const oldest = { date: '2025-06-28', dateLabel: '2025-06-28', session: 'Older session 59', score: 70, status: 'On Target' };
    await page.route(`${API}/coach/admin/coaches/*/trends`, (route) =>
      route.fulfill({
        json: {
          scoreSeries: [oldest, { ...oldest, date: '2026-08-29', dateLabel: 'August 29, 2026', session: 'Obadiah, Lesson 4' }],
          clusterSeries: [],
          dimensionSeries: [],
          delta: null,
        },
      }),
    );
    const details: string[] = [];
    page.on('request', (r) => {
      const path = new URL(r.url()).pathname;
      if (/\/admin\/coaches\/[^/]+\/reports\/(?!summary)/.test(path)) details.push(path);
    });
    await page.goto(`/coach/leader/${LEADER_ID}/manage`);

    const chart = page.getByTestId('coach-trend-score').locator('.recharts-surface');
    await expect(chart).toBeVisible();
    const box = await chart.boundingBox();
    if (!box) throw new Error('no chart');
    await page.mouse.move(box.x + 70, box.y + box.height / 2);
    await page.mouse.click(box.x + 70, box.y + box.height / 2);

    await expect(page.getByText('Selected session — full report')).toBeVisible();
    await expect.poll(() => details).toContain(`/coach/admin/coaches/${LEADER_ID}/reports/${olderId(59)}`);
    await capture(page, testInfo, 'w2a-trend-point-older-session');
  });

  test('a trend point carrying its report id opens that report without paging the summaries', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'the trend charts render on the desktop layout');
    await useCoachApi(page, { admin: true, historyLength: 60 });
    const oldest = { date: '2025-06-28', dateLabel: '2025-06-28', session: 'Older session 59', score: 70, status: 'On Target' };
    await page.route(`${API}/coach/admin/coaches/*/trends`, (route) =>
      route.fulfill({
        json: {
          scoreSeries: [
            { ...oldest, reportId: olderId(59) },
            { ...oldest, date: '2026-08-29', dateLabel: 'August 29, 2026', session: 'Obadiah, Lesson 4', reportId: 'leader-2026-08-29-saturday-morning' },
          ],
          clusterSeries: [],
          dimensionSeries: [],
          delta: null,
        },
      }),
    );
    const summaries: string[] = [];
    const details: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      if (url.pathname.endsWith('/reports/summary')) summaries.push(url.search);
      else if (/\/admin\/coaches\/[^/]+\/reports\/[^/]+$/.test(url.pathname)) details.push(url.pathname);
    });
    await page.goto(`/coach/leader/${LEADER_ID}/manage`);

    const chart = page.getByTestId('coach-trend-score').locator('.recharts-surface');
    await expect(chart).toBeVisible();
    const box = await chart.boundingBox();
    if (!box) throw new Error('no chart');
    await page.mouse.move(box.x + 70, box.y + box.height / 2);
    await page.mouse.click(box.x + 70, box.y + box.height / 2);

    await expect(page.getByText('Selected session — full report')).toBeVisible();
    await expect.poll(() => details).toContain(`/coach/admin/coaches/${LEADER_ID}/reports/${olderId(59)}`);
    expect(summaries).toHaveLength(1);
    await capture(page, testInfo, 'w2b-trend-point-by-id');
  });
});
