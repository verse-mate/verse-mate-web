import { expect, test } from '@playwright/test';

import { API, capture, LEADER_ID, OLDER_ID, PARALLEL_RUN_RESHARE, PARALLEL_RUN_SESSION, PARALLEL_RUN_SESSION_REFUSAL, useCoachApi } from './fixtures';

const LABEL = 'Parallel-run copy: kept for comparison, never sent.';

test.describe('A session observed during the parallel run', () => {
  test('is labelled on the failures list and offers no release, which the server refuses for it', async ({ page }, testInfo) => {
    const writes: string[] = [];
    await useCoachApi(page, { admin: true, pipelineLive: true, parallelRunCopies: true, onAdminWrite: (m, p) => writes.push(`${m} ${p}`) });
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-pipeline').click();

    const row = page.getByTestId(`coach-pipeline-${PARALLEL_RUN_SESSION.sourceSessionId}`);
    await expect(row.getByTestId(`coach-pipeline-parallel-run-${PARALLEL_RUN_SESSION.sourceSessionId}`)).toHaveText(LABEL);
    await expect(row.getByTestId(`coach-pipeline-release-${PARALLEL_RUN_SESSION.sourceSessionId}`)).toHaveCount(0);
    await expect(row.getByTestId(`coach-pipeline-requeue-${PARALLEL_RUN_SESSION.sourceSessionId}`)).toHaveCount(0);
    await capture(page, testInfo, 'pb1-parallel-run-failures-row', row);
    expect(writes).toEqual([]);
  });

  test('is labelled in the re-share queue, offers no ask, and can still be marked re-shared', async ({ page }, testInfo) => {
    const writes: string[] = [];
    await useCoachApi(page, { admin: true, pipelineLive: true, parallelRunCopies: true, onAdminWrite: (m, p) => writes.push(`${m} ${p}`) });
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-trends').click();

    const row = page.getByTestId(`coach-reshare-${PARALLEL_RUN_RESHARE.sourceSessionId}`);
    await expect(row).toContainText(LABEL);
    await expect(row).toContainText('2026-08-15 · started 9:00 AM CDT ·');
    await expect(row.getByTestId(`coach-reshare-send-${PARALLEL_RUN_RESHARE.sourceSessionId}`)).toHaveCount(0);
    await capture(page, testInfo, 'pb1-parallel-run-reshare-row', row);
    await row.getByTestId(`coach-reshare-resolve-${PARALLEL_RUN_RESHARE.sourceSessionId}`).click();
    await expect(page.getByTestId('coach-pending-reshares')).toHaveCount(0);
    expect(writes).toEqual([`POST /coach/admin/reshares/${PARALLEL_RUN_RESHARE.sourceSessionId}/resolve`]);
  });

  test('is labelled on its review, and saved improvements are said never to be sent', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, pipelineLive: true, parallelRunCopies: true });
    await page.goto('/coach');
    await page.getByTestId(`oversight-roster-${LEADER_ID}`).click();
    await page.getByTestId(`oversight-class-${OLDER_ID}`).click();

    const panel = page.getByTestId(`coach-review-${OLDER_ID}`);
    await expect(panel.getByTestId('coach-review-parallel-run')).toHaveText(LABEL);
    await expect(panel.getByRole('heading', { level: 3 })).toHaveText('Review before delivery');
    await capture(page, testInfo, 'pb1-parallel-run-review-heading', panel.getByTestId('coach-review-parallel-run'));
    await panel.getByTestId('coach-improvements-open').click();
    await panel.getByTestId('coach-improvements-text').fill('Name the big idea up front');
    await panel.getByTestId('coach-improvements-save').click();
    await expect(panel.getByTestId('coach-improvements-outcome')).toHaveText(
      'Improvements saved. Nothing was sent: this is a parallel-run copy, kept for comparison and never sent.',
    );
    await capture(page, testInfo, 'pb1-parallel-run-review', panel);
  });

  test('a release or a re-share send that reaches the fake API anyway is refused as the server refuses it', async ({ page }) => {
    await useCoachApi(page, { admin: true, pipelineLive: true, parallelRunCopies: true });
    await page.goto('/coach');
    const answers = await page.evaluate(
      async ([api, reportId, reshareId]) => {
        const post = async (path: string) => {
          const res = await fetch(`${api}/coach/${path}`, { method: 'POST' });
          const body = await res.json();
          return [res.status, body.details?.refusal, body.message];
        };
        return [await post(`admin/reports/${reportId}/release`), await post(`admin/reshares/${reshareId}/send`)];
      },
      [API, OLDER_ID, PARALLEL_RUN_RESHARE.sourceSessionId],
    );
    expect(answers).toEqual([
      [409, 'parallel-run-session', PARALLEL_RUN_SESSION_REFUSAL],
      [409, 'parallel-run-session', PARALLEL_RUN_SESSION_REFUSAL],
    ]);
  });
});
