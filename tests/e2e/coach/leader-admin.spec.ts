import { expect, test } from '@playwright/test';

import {
  API,
  AWAITING_RELEASE_SESSIONS,
  capture,
  EMAIL_RULE,
  FAILED_SEND_LEADER,
  FAILED_SEND_SESSIONS,
  LEADER_ID,
  NEWEST_ID,
  OLDER_ID,
  olderId,
  PLACEHOLDER_LEADER,
  SKIPPED_SESSION,
  UNCONFIRMED_SEND_SESSION,
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
  test('a placeholder reads as no real address yet, and an admin asks for the real one to be confirmed', async ({ page }, testInfo) => {
    const writes: string[] = [];
    await useCoachApi(page, { admin: true, leaderAdmin: true, onAdminWrite: (m, p) => writes.push(`${m} ${p}`) });
    await openPipeline(page);

    const row = page.getByTestId(`coach-coverage-${PLACEHOLDER_LEADER.id}`);
    await expect(row.getByTestId(`coach-address-${PLACEHOLDER_LEADER.id}`)).toHaveText('No real address yet');
    await expect(row).not.toContainText('needs-real-email');
    await expect(page.getByTestId('coach-address-uncovered').locator(`xpath=ancestor-or-self::*[contains(@class,"ph-no-capture")]`).first()).toBeAttached();
    await capture(page, testInfo, 'w2a-address-placeholder', row);

    await row.getByTestId(`coach-address-edit-${PLACEHOLDER_LEADER.id}`).click();
    await row.getByTestId(`coach-address-input-${PLACEHOLDER_LEADER.id}`).fill('carol@example.test');
    await row.getByTestId(`coach-address-save-${PLACEHOLDER_LEADER.id}`).click();
    await expect(row.getByTestId(`coach-address-error-${PLACEHOLDER_LEADER.id}`)).toContainText(
      'Another leader already uses that address',
    );
    await capture(page, testInfo, 'w2a-address-taken', row);

    await row.getByTestId(`coach-address-input-${PLACEHOLDER_LEADER.id}`).fill('dana,diaz@example.test');
    await expect(row.getByTestId(`coach-address-error-${PLACEHOLDER_LEADER.id}`)).toHaveText(EMAIL_RULE);
    await expect(row.getByTestId(`coach-address-save-${PLACEHOLDER_LEADER.id}`)).toBeDisabled();
    await capture(page, testInfo, 'p2-address-rule', row);

    await row.getByTestId(`coach-address-input-${PLACEHOLDER_LEADER.id}`).fill('  Dana@Example.test ');
    await row.getByTestId(`coach-address-save-${PLACEHOLDER_LEADER.id}`).click();
    await expect(page.getByText('A confirmation link went to the new address. The address changes only once it is confirmed there, by Oct 16, 2026; reports keep going to the current address until then.')).toBeVisible();
    await expect(row.getByTestId(`coach-address-${PLACEHOLDER_LEADER.id}`)).toHaveText('No real address yet');
    await expect(page.getByTestId(`coach-pipeline-${SKIPPED_SESSION.sourceSessionId}`)).toHaveCount(1);
    expect(writes).toContain(`PUT /coach/admin/leaders/${PLACEHOLDER_LEADER.id}/email`);
    await capture(page, testInfo, 'w2a-address-saved', row);
  });

  test("the benchmark leader's address change is sent for confirmation only after the admin confirms it", async ({ page }, testInfo) => {
    const writes: Array<[string, unknown]> = [];
    await useCoachApi(page, { admin: true, leaderAdmin: true, pipelineLive: true, onAdminWrite: (_m, p, b) => writes.push([p, b]) });
    await openPipeline(page);

    const row = page.getByTestId(`coach-coverage-${LEADER_ID}`);
    await row.getByTestId(`coach-address-edit-${LEADER_ID}`).click();
    await row.getByTestId(`coach-address-input-${LEADER_ID}`).fill('avery.new@example.test');
    await row.getByTestId(`coach-address-save-${LEADER_ID}`).click();
    const ask = row.getByTestId(`coach-address-confirm-${LEADER_ID}`);
    await expect(ask).toContainText("This is the benchmark leader, whose address receives every leader's reports.");
    await expect(row.getByTestId(`coach-address-${LEADER_ID}`)).toHaveText('leader@example.test');
    await capture(page, testInfo, 'p2-benchmark-confirm', row);

    await ask.getByTestId(`coach-address-confirm-save-${LEADER_ID}`).click();
    await expect(page.getByText('A confirmation link went to the new address. The address changes only once it is confirmed there, by Oct 16, 2026; reports keep going to the current address until then.')).toBeVisible();
    await expect(row.getByTestId(`coach-address-${LEADER_ID}`)).toHaveText('leader@example.test');
    expect(writes).toEqual([
      [`/coach/admin/leaders/${LEADER_ID}/email`, { email: 'avery.new@example.test' }],
      [`/coach/admin/leaders/${LEADER_ID}/email`, { email: 'avery.new@example.test', confirm: true }],
    ]);
    await capture(page, testInfo, 'p2-benchmark-changed', row);
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
    await expect(keywords.locator('xpath=ancestor::*[contains(@class,"ph-no-capture")]').first()).toBeAttached();

    await keywords.fill('tuesday night\nhb');
    await expect(row.getByTestId('coach-attribution-error-evan-ellis')).toContainText('at least three characters: hb');
    await expect(row.getByTestId('coach-attribution-save-evan-ellis')).toBeDisabled();
    await capture(page, testInfo, 'w2b-attribution-short-keyword', row);

    await row.getByTestId('coach-attribution-emails-evan-ellis').fill('evan.personal@example.test\nnot-an-address');
    await keywords.fill('tuesday night\nHabakkuk study');
    await expect(row.getByTestId('coach-attribution-error-evan-ellis')).toHaveText(`Alternate address "not-an-address": ${EMAIL_RULE}`);
    await expect(row.getByTestId('coach-attribution-save-evan-ellis')).toBeDisabled();
    await capture(page, testInfo, 'p2-attribution-address-rule', row);

    await row.getByTestId('coach-attribution-emails-evan-ellis').fill('evan.personal@example.test');
    await keywords.fill('tuesday night\nAvery');
    await row.getByTestId('coach-attribution-save-evan-ellis').click();
    await expect(row.getByTestId('coach-attribution-error-evan-ellis')).toHaveText(
      `Refused (409): Keywords refused: "avery" is inside the name of ${LEADER_ID}`,
    );
    await capture(page, testInfo, 'p2-attribution-keyword-refused', row);

    await keywords.fill('tuesday night\nHabakkuk study');
    await row.getByTestId('coach-attribution-save-evan-ellis').click();
    await expect(row.getByTestId('coach-attribution-saved-evan-ellis')).toHaveText('Saved. 1 unattributed session now matches a leader.');
    await expect(page.getByTestId(`coach-pipeline-${UNRESOLVED_SESSION.sourceSessionId}`)).toHaveCount(0);
    expect(writes.at(-1)).toEqual([
      '/coach/admin/leaders/evan-ellis/attribution',
      { titleMatch: ['tuesday night', 'Habakkuk study'], altEmails: ['evan.personal@example.test'] },
    ]);
    await capture(page, testInfo, 'w2b-attribution-saved', row);
  });

  test('a keyword matches whole words of a title only', async ({ page }) => {
    await useCoachApi(page, { admin: true, leaderAdmin: true });
    await openPipeline(page);

    const row = page.getByTestId('coach-coverage-evan-ellis');
    await row.getByTestId('coach-attribution-edit-evan-ellis').click();
    await row.getByTestId('coach-attribution-keywords-evan-ellis').fill('tuesday night\nhabak');
    await row.getByTestId('coach-attribution-save-evan-ellis').click();
    await expect(row.getByTestId('coach-attribution-saved-evan-ellis')).toHaveText('Saved. 0 unattributed sessions now match a leader.');
    await expect(page.getByTestId(`coach-pipeline-${UNRESOLVED_SESSION.sourceSessionId}`)).toContainText('unattributed');
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
    await expect(page.locator(`${REPLAY_BLOCKED} [data-sonner-toast]`)).toHaveText(
      'Assigned to Evan Ellis. It is observed now: a later pipeline run scores it for them, and it is then held until an admin releases it from this list.',
    );
    await expect(row).toHaveCount(0);
    expect(writes).toContainEqual([
      `/coach/admin/sessions/${UNRESOLVED_SESSION.sourceSessionId}/attribute`,
      { coachId: 'evan-ellis', expectedCoachId: null },
    ]);
    await capture(page, testInfo, 'p6-assign-scored-later');
  });

  test('a session awaiting release in a delivery state offers only the release, which delivers it', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, pipelineLive: true, awaitingRelease: true });
    await openPipeline(page);

    for (const session of AWAITING_RELEASE_SESSIONS) {
      const row = page.getByTestId(`coach-pipeline-${session.sourceSessionId}`);
      await expect(row).toContainText(`${session.state} ·`);
      await expect(row).toContainText('Why: re-attributed: held until an admin releases it');
      await expect(row.getByTestId(`coach-pipeline-requeue-${session.sourceSessionId}`)).toHaveCount(0);
      await expect(row.getByTestId(`coach-pipeline-release-${session.sourceSessionId}`)).toBeVisible();
    }
    await capture(page, testInfo, 'p4-awaiting-release', page.getByTestId(`coach-pipeline-${AWAITING_RELEASE_SESSIONS[1].sourceSessionId}`));

    for (const session of AWAITING_RELEASE_SESSIONS) {
      await page.getByTestId(`coach-pipeline-release-${session.sourceSessionId}`).click();
      await expect(page.getByTestId(`coach-pipeline-${session.sourceSessionId}`)).toHaveCount(0);
    }
    await expect(page.getByText('Released and delivered to the leader.').first()).toBeVisible();
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

test.describe('A failed send in the pipeline list', () => {
  test('says why out of session replay, offers the address fix beside it, and the requeue once retries run out', async ({ page }, testInfo) => {
    const writes: Array<[string, unknown]> = [];
    const pipeline: string[] = [];
    await useCoachApi(page, {
      admin: true,
      failedSends: true,
      onAdminWrite: (m, p, b) => writes.push([`${m} ${p}`, b]),
      onPipelineRequest: (u) => pipeline.push(u),
    });
    await openPipeline(page);
    const [retrying, exhausted] = FAILED_SEND_SESSIONS;

    for (const session of FAILED_SEND_SESSIONS) {
      const row = page.getByTestId(`coach-pipeline-${session.sourceSessionId}`);
      await expect(row).toContainText(FAILED_SEND_LEADER.name);
      await expect(row).toContainText(`Why: ${session.reason}`);
      await expect(row.locator(REPLAY_BLOCKED).filter({ hasText: 'send failed to' })).toHaveCount(1);
      await expect(row.locator(REPLAY_BLOCKED).filter({ hasText: FAILED_SEND_LEADER.email })).not.toHaveCount(0);
      await expect(row.getByTestId(`coach-address-edit-${FAILED_SEND_LEADER.id}`)).toBeVisible();
      await expect(row.getByTestId(`coach-pipeline-release-${session.sourceSessionId}`)).toHaveCount(0);
    }
    const unconfirmedRow = page.getByTestId(`coach-pipeline-${UNCONFIRMED_SEND_SESSION.sourceSessionId}`);
    await expect(unconfirmedRow).toContainText(`Why: ${UNCONFIRMED_SEND_SESSION.reason}`);
    await expect(unconfirmedRow.getByTestId(`coach-address-edit-${FAILED_SEND_LEADER.id}`)).toBeVisible();
    await capture(page, testInfo, 'pb1-unconfirmed-send-address-fix', unconfirmedRow);
    const retryRow = page.getByTestId(`coach-pipeline-${retrying.sourceSessionId}`);
    await expect(retryRow.getByTestId(`coach-pipeline-requeue-${retrying.sourceSessionId}`)).toHaveCount(0);
    await capture(page, testInfo, 'p5-failed-send-retrying', retryRow);

    const row = page.getByTestId(`coach-pipeline-${exhausted.sourceSessionId}`);
    await expect(row).toContainText('retries exhausted: fix the failing address, then requeue it');
    await row.getByTestId(`coach-address-edit-${FAILED_SEND_LEADER.id}`).click();
    await row.getByTestId(`coach-address-input-${FAILED_SEND_LEADER.id}`).fill('carol@church.test');
    await capture(page, testInfo, 'p5-failed-send-address-fix', row);
    await row.getByTestId(`coach-address-save-${FAILED_SEND_LEADER.id}`).click();
    await expect(page.getByText('A confirmation link went to the new address. The address changes only once it is confirmed there, by Oct 16, 2026; reports keep going to the current address until then.')).toBeVisible();
    await expect(row.getByTestId(`coach-address-${FAILED_SEND_LEADER.id}`)).toHaveText('carol@example.test');

    await row.getByTestId(`coach-pipeline-requeue-${exhausted.sourceSessionId}`).click();
    await expect(page.getByTestId(`coach-pipeline-${exhausted.sourceSessionId}`)).toHaveCount(0);
    await expect(retryRow).toBeVisible();
    expect(writes).toEqual([[`PUT /coach/admin/leaders/${FAILED_SEND_LEADER.id}/email`, { email: 'carol@church.test' }]]);
    expect(pipeline.filter((u) => u.endsWith('/requeue'))).toEqual([`/coach/admin/pipeline-failures/${exhausted.sourceSessionId}/requeue`]);
    await capture(page, testInfo, 'p5-failed-send-requeued');
  });
});

test.describe('Coverage', () => {
  test('tells attested from not observed, and an admin marks and clears not teaching', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, leaderAdmin: true });
    await openPipeline(page);

    await expect(page.getByTestId('coach-coverage-basis-evan-ellis')).toHaveText('Not teaching (attested)');
    await expect(page.getByTestId('coach-coverage-attested-evan-ellis')).toContainText('admin@example.test');
    await expect(page.getByTestId('coach-coverage-basis-uncovered')).toHaveText('Not covered · Not observed');
    await expect(page.getByTestId('coach-coverage-evan-ellis')).toContainText('has a VerseMate account');
    await expect(page.getByTestId(`coach-coverage-${PLACEHOLDER_LEADER.id}`)).toContainText('no VerseMate account');
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

    await page.getByTestId('oversight-invite-name').fill('Faith Ford');
    await page.getByTestId('oversight-invite-email').fill('faith@example.test.');
    await page.getByTestId('oversight-invite-send').click();
    await expect(page.getByTestId('oversight-invite-error')).toHaveText(EMAIL_RULE);
    await capture(page, testInfo, 'p2-add-leader-rule', page.getByTestId('oversight-invite-modal'));
    await page.getByTestId('oversight-invite-email').fill('Faith@Example.test');

    const summaries: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/reports/summary')) summaries.push(new URL(r.url()).pathname);
    });
    await page.getByTestId('oversight-invite-send').click();
    await expect(page.getByTestId('oversight-invite-modal')).toHaveCount(0);
    await expect(page.getByTestId('oversight-back')).toBeVisible();
    await expect.poll(() => summaries).toContain('/coach/admin/coaches/faith-ford/reports/summary');
    await capture(page, testInfo, 'w2a-add-leader-opened');
  });
});

test.describe('A new leader whose name contains a keyword', () => {
  test("is refused in the form in words, naming the keyword and its leader, and the form keeps the name", async ({ page }, testInfo) => {
    const writes: string[] = [];
    await useCoachApi(page, { admin: true, leaderAdmin: true, onAdminWrite: (m, p) => writes.push(`${m} ${p}`) });
    await page.goto('/coach');
    await page.getByTestId('oversight-add-leader').click();
    await page.getByTestId('oversight-invite-name').fill('Tuesday Night Smith');
    await page.getByTestId('oversight-invite-email').fill('tn.smith@example.test');
    await page.getByTestId('oversight-invite-send').click();

    await expect(page.getByTestId('oversight-invite-error')).toHaveText(
      'Name refused: it contains "tuesday night", a keyword of evan-ellis. Their sessions would be routed to that leader. Enter a different name or change that leader\'s keywords first.',
    );
    await expect(page.getByTestId('oversight-invite-modal')).toBeVisible();
    await expect(page.getByTestId('oversight-invite-name')).toHaveValue('Tuesday Night Smith');
    await capture(page, testInfo, 'p4-add-leader-keyword', page.getByTestId('oversight-invite-modal'));

    await page.getByTestId('oversight-invite-name').fill('Faith Ford');
    await page.getByTestId('oversight-invite-send').click();
    await expect(page.getByTestId('oversight-invite-modal')).toHaveCount(0);
    expect(writes).toEqual(['POST /coach/admin/leaders', 'POST /coach/admin/leaders']);
  });
});

test.describe("A leader's history on the admin screens", () => {
  test('a failed next page on the drill-in keeps the page and retries', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, historyLength: 60 });
    let failNext = true;
    await page.route(/\/coach\/admin\/coaches\/[^/]+\/reports\/summary\?.*offset=50/, (route) => {
      if (!failNext) return route.fallback();
      failNext = false;
      return route.fulfill({ status: 500, json: { error: 'INTERNAL_SERVER_ERROR', message: 'database unavailable' } });
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

test.describe('A pipeline copy held from its leader', () => {
  test("is marked as admin-only on every admin view of the leader's sessions, and a note on it is refused", async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, heldReports: [OLDER_ID] });

    await page.goto(`/coach/leader/${LEADER_ID}/sessions`);
    await expect(page.getByTestId(`coach-pipeline-copy-${OLDER_ID}`)).toHaveText('Pipeline copy, not visible to the leader');
    await expect(page.getByTestId(`coach-pipeline-copy-${NEWEST_ID}`)).toHaveCount(0);
    await capture(page, testInfo, 'p2-held-sessions', page.getByTestId(`coach-pipeline-copy-${OLDER_ID}`));

    await page.goto(`/coach/leader/${LEADER_ID}?s=${OLDER_ID}`);
    await expect(page.getByTestId(`coach-pipeline-copy-${OLDER_ID}`)).toBeVisible();
    await capture(page, testInfo, 'p2-held-dashboard', page.getByTestId(`coach-pipeline-copy-${OLDER_ID}`));

    await page.goto(`/coach/leader/${LEADER_ID}/manage`);
    await expect(page.getByTestId(`coach-pipeline-copy-${OLDER_ID}`)).toBeVisible();

    await page.goto('/coach');
    await page.getByTestId(`oversight-roster-${LEADER_ID}`).click();
    await expect(page.getByTestId(`coach-pipeline-copy-${OLDER_ID}`)).toBeVisible();
    await page.getByTestId(`oversight-comment-${OLDER_ID}`).fill('Strong close.');
    await page.getByTestId(`oversight-comment-send-${OLDER_ID}`).click();
    await expect(page.getByTestId(`oversight-comment-error-${OLDER_ID}`)).toContainText('Release it first.');
    await capture(page, testInfo, 'p2-held-note-refused', page.getByTestId(`oversight-comment-error-${OLDER_ID}`));
  });

  test('is marked in the full report on the manage screen, though the report detail does not carry held', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'the full report renders on the desktop layout');
    await useCoachApi(page, { admin: true, heldReports: [NEWEST_ID] });
    await page.goto(`/coach/leader/${LEADER_ID}/manage`);
    const detail = page.getByTestId(`coach-report-detail-${NEWEST_ID}`);
    await expect(detail.getByTestId(`coach-pipeline-copy-${NEWEST_ID}`)).toHaveText('Pipeline copy, not visible to the leader');
    await capture(page, testInfo, 'p6-held-manage-detail', detail);
    await page.getByTestId('coach-leader-minimize').click();
    await expect(page.getByTestId(`coach-report-${NEWEST_ID}`).getByTestId(`coach-pipeline-copy-${NEWEST_ID}`)).toBeVisible();
  });

  test("never reaches the leader's own list", async ({ page }) => {
    await useCoachApi(page, { heldReports: [OLDER_ID] });
    await page.goto('/coach/sessions');
    await expect(page.getByText('Obadiah, Lesson 4').first()).toBeVisible();
    await expect(page.getByText('Obadiah, Lesson 3')).toHaveCount(0);
    await expect(page.getByTestId(`coach-pipeline-copy-${OLDER_ID}`)).toHaveCount(0);
  });
});
