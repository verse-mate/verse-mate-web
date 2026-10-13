import { expect, type Page, test } from '@playwright/test';

import { capture, FAILED_SEND_LEADER, LEADER_ID, useCoachApi } from './fixtures';

const CAROL = FAILED_SEND_LEADER.id;

const COMPARISON = {
  sessions: [
    {
      coachId: LEADER_ID,
      date: '2026-09-12',
      backend: { sourceSessionId: 'ff-close', reportId: 'be-close', composite: 74.5 },
      host: { reportId: 'host-close', composite: 78 },
      compositeDifference: 3.5,
      dimensions: [
        { n: 1, host: 4, backend: 4, difference: 0 },
        { n: 2, host: 3, backend: 4, difference: 1 },
        { n: 3, host: null, backend: null, difference: null },
      ],
      withinOne: 2,
      comparable: 2,
      flagged: false,
      flagReasons: [],
    },
    {
      coachId: CAROL,
      date: '2026-09-05',
      backend: { sourceSessionId: 'ff-far', reportId: 'be-far', composite: 61 },
      host: { reportId: 'host-far', composite: 70 },
      compositeDifference: 9,
      dimensions: [
        { n: 1, host: 4, backend: 2, difference: 2 },
        { n: 2, host: 3, backend: 3, difference: 0 },
        { n: 3, host: 4, backend: 4, difference: 0 },
      ],
      withinOne: 2,
      comparable: 3,
      flagged: true,
      flagReasons: ['composite', 'dimension'],
    },
  ],
  needsPairing: [
    {
      coachId: LEADER_ID,
      date: '2026-09-19',
      backend: [
        { sourceSessionId: 'ff-am', reportId: 'be-am' },
        { sourceSessionId: 'ff-pm', reportId: 'be-pm' },
      ],
      host: [{ reportId: 'host-19' }],
    },
  ],
  unmatched: {
    backend: [{ coachId: CAROL, date: '2026-09-26', sourceSessionId: 'ff-only', reportId: 'be-only' }],
    host: [{ coachId: LEADER_ID, date: '2026-08-29', reportId: 'host-only' }],
  },
  share: { withinOne: 4, comparable: 5, ratio: 0.8 },
  counts: { compared: 2, flagged: 1, needsPairing: 1, unmatchedBackend: 1, unmatchedHost: 1 },
};

async function openComparison(page: Page) {
  await page.goto('/coach');
  await page.getByTestId('oversight-nav-parallel-run').click();
}

test.describe('The parallel-run comparison', () => {
  test('shows the share within one point, flagged sessions first, the sessions to pair and each side alone', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, failedSends: true, parallelRun: COMPARISON });
    await openComparison(page);

    await expect(page.getByTestId('coach-parallel-share')).toHaveText('4 of 5 dimensions within one point (80%)');
    await expect(page.getByTestId('coach-parallel-counts')).toContainText('2 compared · 1 flagged · 1 to pair');
    const rows = page.getByTestId(/^coach-parallel-session-/);
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toHaveAttribute('data-testid', 'coach-parallel-session-ff-far');
    await expect(rows.first().getByTestId('coach-parallel-flagged-ff-far')).toHaveText(
      'Flagged for the cutover read: composite more than 5 points apart, a dimension 2 or more apart',
    );
    await expect(rows.first()).toContainText(`${FAILED_SEND_LEADER.name} · 2026-09-05`);
    await expect(page.getByTestId('coach-parallel-dim-ff-close-3')).toContainText('N/A, left out of the share');
    await capture(page, testInfo, 'parallel-run-compared');

    await page.getByTestId('coach-parallel-only-flagged').check();
    await expect(rows).toHaveCount(1);
    await capture(page, testInfo, 'parallel-run-only-flagged');
    await page.getByTestId('coach-parallel-only-flagged').uncheck();

    await expect(page.getByTestId(`coach-parallel-pairing-${LEADER_ID}-2026-09-19`)).toContainText('2 backend sessions (ff-am, ff-pm) · 1 host report (host-19)');
    await expect(page.getByTestId('coach-parallel-unmatched-backend')).toContainText(`${FAILED_SEND_LEADER.name} · 2026-09-26 · session ff-only`);
    await expect(page.getByTestId('coach-parallel-unmatched-host')).toContainText('Avery Hollis · 2026-08-29 · report host-only');
    await page.getByTestId(`coach-parallel-pairing-${LEADER_ID}-2026-09-19`).scrollIntoViewIfNeeded();
    await capture(page, testInfo, 'parallel-run-pairing-unmatched', page.getByTestId('coach-parallel-unmatched-host'));
  });

  test('says a host report with no composite has none, without flagging the session for it', async ({ page }) => {
    const [close] = COMPARISON.sessions;
    const noComposite = { ...close, host: { reportId: 'host-close', composite: null }, compositeDifference: null };
    await useCoachApi(page, { admin: true, parallelRun: { ...COMPARISON, sessions: [noComposite] } });
    await openComparison(page);

    const row = page.getByTestId('coach-parallel-session-ff-close');
    await expect(row).toContainText('Composite: Backend 74.5 · no composite on the host report · 2 of 2 dimensions within one point');
    await expect(row.getByTestId('coach-parallel-flagged-ff-close')).toHaveCount(0);
  });

  test('says nothing has been compared yet before any session is scored', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true });
    await openComparison(page);
    await expect(page.getByTestId('coach-parallel-empty')).toContainText('Nothing has been compared yet');
    await capture(page, testInfo, 'parallel-run-empty');
  });
});
