import { expect, type Page, test } from '@playwright/test';

import { capture, LEADER_ID, NEWEST_ID, OLDER_ID, useCoachApi } from './fixtures';

async function openSession(page: Page, reportId: string) {
  await page.goto('/coach');
  await page.getByTestId(`oversight-roster-${LEADER_ID}`).click();
  await page.getByTestId(`oversight-class-${reportId}`).click();
}

test.describe('Amending a delivered report', () => {
  test('shows the delivered version beside the amended one, and a parallel-run revision waits for cutover', async ({ page }, testInfo) => {
    const writes: string[] = [];
    await useCoachApi(page, { admin: true, onAdminWrite: (m, p) => writes.push(`${m} ${p}`) });
    await openSession(page, NEWEST_ID);
    const panel = page.getByTestId(`coach-review-${NEWEST_ID}`);
    await expect(panel).toHaveClass(/ph-no-capture/);

    await panel.getByTestId('coach-amend-open').click();
    await panel.getByTestId('coach-amend-dim-score-5').selectOption('2');
    await panel.getByTestId('coach-amend-dim-rationale-5').fill('Fewer open questions than the passage invited.');
    await panel.getByTestId('coach-amend-headline').fill('A strong session with room to ask more');
    await capture(page, testInfo, 'w2b-amend-editor', panel.getByTestId('coach-amend-headline'));

    await panel.getByTestId('coach-amend-review').click();
    const diff = panel.getByTestId('coach-amend-diff');
    await expect(diff).toContainText("4 · The model's reason for dimension 5");
    await expect(diff).toContainText('2 · Fewer open questions than the passage invited.');
    await expect(diff).toContainText('A strong session');
    expect(writes).toEqual([]);
    await capture(page, testInfo, 'w2b-amend-confirm', diff);

    await panel.getByTestId('coach-amend-confirm').click();
    await expect(panel.getByTestId('coach-amend-outcome')).toContainText(
      'Revision 1 is stored but not sent: the pipeline is in its parallel run',
    );
    const kept = panel.getByTestId('coach-revision-1');
    await expect(kept).toContainText('Not sent');
    await expect(kept).toContainText('admin@example.test');
    await kept.getByTestId('coach-revision-send-1').click();
    await expect(panel.getByTestId('coach-revision-outcome')).toContainText(
      'Refused (409): The pipeline is in its parallel run: nothing is sent until cutover',
    );
    expect(writes).toEqual([
      `POST /coach/admin/reports/${NEWEST_ID}/amend`,
      `POST /coach/admin/reports/${NEWEST_ID}/revision/send`,
    ]);
    await capture(page, testInfo, 'w2b-amend-parallel-run', kept);
  });

  test('once the pipeline is live, the revision goes out and a placeholder address is named as skipped', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, pipelineLive: true });
    await openSession(page, NEWEST_ID);
    const panel = page.getByTestId(`coach-review-${NEWEST_ID}`);
    await panel.getByTestId('coach-amend-open').click();
    await panel.getByTestId('coach-amend-dim-rationale-3').fill('Cited the passage at 14:05 and tied it back twice.');
    await panel.getByTestId('coach-amend-review').click();
    await panel.getByTestId('coach-amend-confirm').click();

    await expect(panel.getByTestId('coach-amend-outcome')).toContainText('Revision 1 saved and re-sent, marked revised.');
    await expect(panel.getByTestId('coach-amend-outcome')).toContainText('1 placeholder address was skipped');
    const kept = panel.getByTestId('coach-revision-1');
    await expect(kept).toContainText('Sent');
    await expect(kept.getByTestId('coach-revision-send-1')).toHaveCount(0);
    await capture(page, testInfo, 'w2b-amend-sent', kept);
  });

  test('a governance block and a cold-recall hold are shown, and the held item is replaced in the same submit', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, pipelineLive: true });
    await openSession(page, NEWEST_ID);
    const panel = page.getByTestId(`coach-review-${NEWEST_ID}`);
    await panel.getByTestId('coach-amend-open').click();

    await panel.getByTestId('coach-amend-headline').fill('Teach it the way Avery does');
    await panel.getByTestId('coach-amend-review').click();
    await panel.getByTestId('coach-amend-confirm').click();
    await expect(panel.getByTestId('coach-amend-violations')).toContainText('benchmark-name: in the body');
    await expect(panel.getByTestId('coach-amend-outcome')).toContainText('The delivered version stays live.');
    await capture(page, testInfo, 'w2b-amend-governance', panel.getByTestId('coach-amend-outcome'));

    await panel.getByTestId('coach-amend-headline').fill('A strong session');
    await panel.getByTestId('coach-amend-first-lesson').check();
    await panel.getByTestId('coach-amend-review').click();
    await panel.getByTestId('coach-amend-confirm').click();
    await expect(panel.getByTestId('coach-amend-held')).toContainText("Recall last week's big idea before the new passage");
    await capture(page, testInfo, 'w2b-amend-cold-recall', panel.getByTestId('coach-amend-held'));

    await panel.getByTestId('coach-amend-improvements').fill('Name the book\'s big idea in the first five minutes');
    await panel.getByTestId('coach-amend-review').click();
    await panel.getByTestId('coach-amend-confirm').click();
    await expect(panel.getByTestId('coach-amend-outcome')).toContainText('Revision 1 saved and re-sent');
  });

  test('a legacy report offers no amend action and says why', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, reviews: { [NEWEST_ID]: 'legacy' } });
    await openSession(page, NEWEST_ID);
    await expect(page.getByTestId('coach-review-readonly')).toContainText('This is a legacy report, which is read-only.');
    await expect(page.getByTestId('coach-amend-open')).toHaveCount(0);
    await capture(page, testInfo, 'w2b-legacy-readonly', page.getByTestId('coach-review-readonly'));
  });
});

test.describe('The first-lesson flag on an undelivered report', () => {
  test('an admin sets it, and clearing it asks for the Memory Reinforcement score and rationale', async ({ page }, testInfo) => {
    const writes: Array<[string, unknown]> = [];
    await useCoachApi(page, { admin: true, onAdminWrite: (_m, p, b) => writes.push([p, b]) });
    await openSession(page, OLDER_ID);
    const panel = page.getByTestId(`coach-review-${OLDER_ID}`);
    await expect(panel.getByTestId('coach-first-lesson-state')).toHaveText('First lesson: no. Passage book: Obadiah.');
    await expect(panel.getByTestId('coach-amend-open')).toHaveCount(0);

    await panel.getByTestId('coach-first-lesson-set').click();
    await expect(panel.getByTestId('coach-first-lesson-outcome')).toContainText('Marked a first lesson. Dimension 9 is not applicable.');
    await expect(panel.getByTestId('coach-first-lesson-state')).toHaveText('First lesson: yes, set by hand. Passage book: Obadiah.');
    await capture(page, testInfo, 'w2b-first-lesson-set', panel);

    await panel.getByTestId('coach-first-lesson-clear').click();
    await expect(panel.getByTestId('coach-first-lesson-save')).toBeDisabled();
    await panel.getByTestId('coach-first-lesson-score').selectOption('3');
    await panel.getByTestId('coach-first-lesson-rationale').fill('They reviewed last week before the new passage.');
    await capture(page, testInfo, 'w2b-first-lesson-clearing', panel);
    await panel.getByTestId('coach-first-lesson-save').click();
    await expect(panel.getByTestId('coach-first-lesson-outcome')).toContainText(
      'First-lesson flag cleared. Dimension 9 is scored 3, recorded as corrected by hand.',
    );
    await expect(panel.getByTestId('coach-first-lesson-state')).toHaveText('First lesson: no. Passage book: Obadiah.');
    expect(writes).toEqual([
      [`/coach/admin/reports/${OLDER_ID}/first-lesson`, { firstLesson: true }],
      [`/coach/admin/reports/${OLDER_ID}/first-lesson`, { firstLesson: false, score: 3, rationale: 'They reviewed last week before the new passage.' }],
    ]);
    await capture(page, testInfo, 'w2b-first-lesson-cleared', panel);
  });
});
