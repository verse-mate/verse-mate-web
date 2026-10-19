import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { type Browser, type Page, expect, test } from '@playwright/test';

import { API_URL, BASE_URL, guestStorageState } from '../fixtures/env';

const DB = process.env.E2E_LEARNING_DB_URL ?? '';
const LOCAL_DB = /^postgres(ql)?:\/\/[^@]*@(localhost|127\.0\.0\.1)(:\d+)?\//.test(DB);
const PASSWORD = 'Learn1ngLocalOnly';
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

test.skip(!LOCAL_DB, 'Needs E2E_LEARNING_DB_URL on a local Postgres and an API with the learning routes');
test.describe.configure({ mode: 'serial' });

function sql(statement: string) {
  execFileSync('psql', [DB, '-v', 'ON_ERROR_STOP=1', '-q', '-c', statement]);
}

async function auth(path: 'signup' | 'login', body: Record<string, string>) {
  return fetch(`${API_URL}/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

async function signUp(first: string, email: string, last = 'Placeholder') {
  const res = await auth('signup', { firstName: first, lastName: last, email, password: PASSWORD });
  expect(res.status, await res.clone().text()).toBe(200);
  return ((await res.json()) as { accessToken: string }).accessToken;
}

async function signInOrUp(first: string, email: string) {
  const res = await auth('login', { email, password: PASSWORD });
  return res.ok ? ((await res.json()) as { accessToken: string }).accessToken : signUp(first, email);
}

async function signedIn(browser: Browser, token: string) {
  const context = await browser.newContext({ storageState: guestStorageState(BASE_URL), viewport: DESKTOP });
  await context.addCookies([{ name: 'accessToken', value: token, url: BASE_URL }]);
  return context.newPage();
}

async function capture(page: Page, name: string) {
  const dir = process.env.E2E_CAPTURE_DIR;
  if (!dir) return;
  await page.screenshot({ path: join(dir, `learning-${name}-desktop.png`), fullPage: true });
  await page.setViewportSize(PHONE);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(dir, `learning-${name}-phone.png`), fullPage: true });
  await page.setViewportSize(DESKTOP);
}

test('an admin publishes a module, a newcomer completes it and asks to join, and the admin approves', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'One run: the program is shared state; captures cover both widths');
  test.setTimeout(240_000);
  sql('TRUNCATE coach_learning_join_requests, coach_learning_submissions, coach_learning_lesson_completions, coach_learning_enrolments, coach_learning_questions, coach_learning_lessons, coach_learning_modules CASCADE');
  const stamp = Date.now();
  const adminEmail = 'learning-admin@example.com';
  const learnerEmail = `learning-learner-${stamp}@example.com`;
  const adminToken = await signInOrUp('Admin', adminEmail);
  const learnerName = `Pat Run${stamp}`;
  const learnerToken = await signUp('Pat', learnerEmail, `Run${stamp}`);
  sql(`UPDATE "user" SET "emailVerified" = true, email_verified_at = now() WHERE email = '${adminEmail}'`);
  sql(`INSERT INTO coach_admins (email) VALUES ('${adminEmail}') ON CONFLICT DO NOTHING`);

  const admin = await signedIn(browser, adminToken);
  const learner = await signedIn(browser, learnerToken);

  await learner.goto('/coach/learning');
  await expect(learner.getByTestId('learning-not-open')).toBeVisible();
  await capture(learner, 'not-open');

  await admin.goto('/coach/admin/learning');
  await expect(admin.getByText('No modules yet')).toBeVisible();
  await capture(admin, 'admin-empty');
  await admin.getByRole('button', { name: 'Write the first module' }).click();
  await expect(admin.getByTestId('learning-admin-module')).toBeVisible();
  await admin.getByTestId('learning-module-title').fill('Placeholder module (test only)');
  await admin.getByTestId('learning-module-description').fill('Placeholder text for a local run. Not real program content.');
  await admin.getByRole('button', { name: 'Save changes' }).first().click();

  for (const [n, prompt] of [[1, 'Placeholder question one?'], [2, 'Placeholder question two?']] as const) {
    await admin.getByRole('button', { name: 'Add a question' }).click();
    const q = admin.getByTestId(`learning-question-${n}`);
    await q.getByTestId('learning-question-prompt').fill(prompt);
    await q.getByTestId('learning-question-option').nth(0).fill('Right answer');
    await q.getByTestId('learning-question-option').nth(1).fill('Wrong answer');
    await q.getByLabel('Option 1 is correct').check();
    await q.getByRole('button', { name: 'Save question' }).click();
    await expect(q.getByRole('button', { name: 'Delete question' })).toBeVisible();
  }

  await admin.getByRole('button', { name: 'Publish module' }).click();
  await expect(admin.getByText('Not published')).toBeVisible();
  await capture(admin, 'admin-publish-refused');

  for (const [title, body, video] of [
    ['Placeholder lesson one', '## Placeholder\n\nLocal test text with **emphasis** and a list:\n\n- one\n- two', true],
    ['Placeholder lesson two', 'Second placeholder lesson. Text only.', false],
  ] as const) {
    await admin.getByRole('button', { name: 'Add a lesson' }).click();
    await expect(admin.getByTestId('learning-admin-lesson')).toBeVisible();
    await admin.getByTestId('learning-lesson-title').fill(title);
    await admin.getByTestId('learning-lesson-body').fill(body);
    if (video) {
      await admin.getByRole('button', { name: 'Add a passage' }).click();
      await admin.getByLabel('From verse').fill('1');
      await admin.getByLabel('To verse').fill('3');
      await admin.getByTestId('learning-video-file').setInputFiles(join(import.meta.dirname, 'tiny.mp4'));
      await expect(admin.getByText('MP4 video')).toBeVisible({ timeout: 30_000 });
    }
    await admin.getByRole('button', { name: 'Save changes' }).first().click();
    await expect(admin.getByText('Learners see the change the next time they open the lesson.')).toBeVisible();
    await admin.getByRole('button', { name: 'Publish lesson' }).click();
    await expect(admin.getByRole('button', { name: 'Unpublish lesson' })).toBeVisible();
    if (video) await capture(admin, 'admin-lesson-editor');
    await admin.getByRole('link', { name: /Module 1, Placeholder module/ }).click();
  }

  await admin.getByRole('button', { name: 'Publish module' }).click();
  await expect(admin.getByRole('button', { name: 'Unpublish module' })).toBeVisible();
  await capture(admin, 'admin-module');
  await admin.goto('/coach/admin/learning');
  await expect(admin.getByText('1 module, 1 published')).toBeVisible();
  await capture(admin, 'admin-modules');

  await learner.goto('/coach');
  await expect(learner.getByTestId('learning-offer')).toBeVisible();
  await capture(learner, 'gate-offer');
  await learner.getByRole('link', { name: 'Start the learning program' }).click();
  await expect(learner.getByRole('button', { name: 'Start the program' })).toBeVisible();
  await capture(learner, 'start');
  await learner.getByRole('button', { name: 'Start the program' }).click();

  await expect(learner.getByRole('heading', { name: 'Placeholder lesson one' })).toBeVisible();
  await expect(learner.getByTestId('learning-lesson-video')).toBeVisible();
  await expect(learner.getByTestId('learning-passage')).toHaveText(/Genesis 1:1–3|Genesis 1:1-3/);
  await capture(learner, 'lesson');
  await learner.getByRole('button', { name: 'Mark as done' }).click();
  await expect(learner.getByText('Lesson done')).toBeVisible();
  await capture(learner, 'lesson-done');

  await learner.goto('/coach/learning');
  await expect(learner.getByTestId('learning-path')).toBeVisible();
  await capture(learner, 'path');
  await learner.getByRole('link', { name: 'Continue' }).click();
  await learner.getByRole('button', { name: 'Mark as done' }).click();
  await learner.getByRole('link', { name: 'Take the check' }).first().click();

  await expect(learner.getByTestId('learning-check')).toBeVisible();
  await learner.getByRole('button', { name: 'Submit answers' }).click();
  await expect(learner.getByText('Answer every question before you submit')).toBeVisible();
  await capture(learner, 'check-incomplete');
  await learner.getByLabel('Right answer').first().check();
  await learner.getByLabel('Wrong answer').nth(1).check();
  await learner.getByRole('button', { name: 'Submit answers' }).click();
  await expect(learner.getByText('Not passed yet. You need 80% to pass.')).toBeVisible();
  await expect(learner.getByRole('heading', { name: 'Module 1 check' })).toBeInViewport();
  await capture(learner, 'check-failed');
  await learner.getByRole('button', { name: 'Retake the check' }).click();
  await learner.getByLabel('Right answer').nth(0).check();
  await learner.getByLabel('Right answer').nth(1).check();
  await learner.getByRole('button', { name: 'Submit answers' }).click();
  await expect(learner.getByText('Passed. Module 1 is done.')).toBeVisible();
  await capture(learner, 'check-passed');

  await learner.goto('/coach/learning/completion');
  await expect(learner.getByText('Confirm your email address first')).toBeVisible();
  await capture(learner, 'completion-unconfirmed');
  sql(`UPDATE "user" SET "emailVerified" = true, email_verified_at = now() WHERE email = '${learnerEmail}'`);
  await learner.reload();
  await learner.getByTestId('learning-request-note').fill('Placeholder note from a local test run.');
  await capture(learner, 'completion-request');
  await learner.getByRole('button', { name: 'Send request' }).click();
  await expect(learner.getByText(/Request open · sent/)).toBeVisible();
  await capture(learner, 'completion-request-open');

  await admin.goto('/coach');
  const requests = admin.getByTestId('learning-requests');
  await expect(requests.getByText(learnerName)).toBeVisible();
  await capture(admin, 'admin-requests');
  await requests.getByRole('button', { name: `Approve ${learnerName}` }).click();
  await expect(admin.getByTestId('learning-approve-name')).toHaveValue(learnerName);
  await capture(admin, 'admin-approve');
  await admin.getByRole('button', { name: 'Approve and send invite' }).click();
  await expect(admin.getByText(`${learnerName} added as a leader`)).toBeVisible();
  await capture(admin, 'admin-approved');

  await admin.goto('/coach/admin/learning/learners');
  await expect(admin.getByTestId('learning-learner-row')).toHaveCount(1);
  await expect(admin.getByTestId('learning-learner-row')).toContainText('Approved');
  await capture(admin, 'admin-learners');

  await learner.goto('/coach/learning/completion');
  await expect(learner.getByText(/Approved ·/)).toBeVisible();
  await capture(learner, 'completion-approved');
});
