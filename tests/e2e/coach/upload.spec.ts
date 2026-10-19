import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { API, capture, LEADER_ID, NEWEST_ID, refuse, serve, useCoachApi } from './fixtures';

const TINY_MP4 = readFileSync(join(import.meta.dirname, 'tiny.mp4'));
const STORE = 'https://storage.example.test';
const CLASSES = [
  { key: 'class:saturday', name: 'Saturday Morning Study', kind: 'registered' },
  { key: 'rotating:7', name: 'Harbor Rotation', kind: 'rotating' },
];

function chicagoToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function daysAgo(n: number) {
  return new Date(Date.parse(`${chicagoToday()}T00:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);
}

function view(over: Record<string, unknown>) {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    coachId: LEADER_ID,
    classKey: 'class:saturday',
    className: 'Saturday Morning Study',
    sessionDate: daysAgo(3),
    title: null,
    status: 'processing',
    reason: null,
    reportId: null,
    createdAt: new Date().toISOString(),
    ...over,
  };
}

interface UploadApi {
  requests: Record<string, unknown>[];
  puts: string[];
  completes: string[];
  refreshes: string[];
}

async function useUploadApi(
  page: Page,
  opts: {
    admin?: boolean;
    uploads?: ReturnType<typeof view>[];
    refusal?: string;
    partDelayMs?: number;
    partStatus?: number | ((path: string) => number);
    completeStatus?: () => number | string;
    refreshStatus?: () => number;
  } = {},
): Promise<UploadApi> {
  const api: UploadApi = { requests: [], puts: [], completes: [], refreshes: [] };
  const uploads = [...(opts.uploads ?? [])];
  const base = opts.admin ? 'admin/uploads' : 'uploads';
  const id = '00000000-0000-4000-8000-0000000000aa';

  await serve(page, (url) => url.href.startsWith(`${API}/coach/uploads/classes`) || url.href.startsWith(`${API}/coach/admin/uploads/classes`), (route) =>
    route.fulfill({ json: { classes: CLASSES } }),
  );
  await serve(page, (url) => url.href.startsWith(`${API}/coach/${base}`) && !url.pathname.includes('/classes'), async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (req.method() === 'GET') return route.fulfill({ json: { uploads } });
    const serverError = { status: 500, json: { error: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } };
    if (path.endsWith('/complete')) {
      api.completes.push(path);
      const completed = opts.completeStatus?.() ?? 200;
      if (typeof completed === 'string') return refuse(route, completed);
      if (completed === 500) return route.fulfill(serverError);
      const sent = view({ id, status: 'processing', title: (api.requests.at(-1)?.title as string | null) ?? null });
      uploads.unshift(sent);
      return route.fulfill({ json: { status: 'processing' } });
    }
    const addresses = () => {
      const bytes = Number(api.requests.at(-1)?.fileBytes);
      return {
        uploadId: id,
        partBytes: Math.ceil(bytes / 3),
        parts: [1, 2, 3].map((n) => ({ partNumber: n, url: `${STORE}/coach-uploads/${id}/part-${n}?sig=e2e` })),
        expiresAt: new Date(Date.now() + 3 * 3_600_000).toISOString(),
      };
    };
    if (path.endsWith('/parts')) {
      api.refreshes.push(path);
      const refreshed = opts.refreshStatus?.() ?? 200;
      if (refreshed === 404) return refuse(route, 'unknown-upload');
      if (refreshed === 500) return route.fulfill(serverError);
      return route.fulfill({ json: addresses() });
    }
    api.requests.push(req.postDataJSON());
    if (opts.refusal) return refuse(route, opts.refusal);
    return route.fulfill({ json: addresses() });
  });
  await page.route(`${STORE}/**`, async (route) => {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'PUT', 'access-control-allow-headers': '*' };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const path = new URL(route.request().url()).pathname;
    api.puts.push(path);
    if (opts.partDelayMs) await new Promise((r) => setTimeout(r, opts.partDelayMs));
    const status = typeof opts.partStatus === 'function' ? opts.partStatus(path) : (opts.partStatus ?? 200);
    return route.fulfill({ status, headers: cors, body: '' });
  });
  return api;
}

async function fillForm(page: Page, date: string, file: { name: string; mimeType: string; buffer: Buffer }) {
  await page.getByTestId('coach-upload-class').selectOption('class:saturday');
  await page.getByTestId('coach-upload-date').fill(date);
  await page.getByTestId('coach-upload-title').fill('Week 4: Romans 8');
  await page.getByTestId('coach-upload-file').setInputFiles(file);
}

const VIDEO = { name: 'saturday.mp4', mimeType: 'video/mp4', buffer: TINY_MP4 };

test.describe('The upload page (8.9)', () => {
  test("The upload page lists only the leader's own classes, and states the limits before a file is chosen", async ({ page }, testInfo) => {
    await useCoachApi(page, { pipelineLive: true });
    await useUploadApi(page);
    await page.goto('/coach/upload');
    await expect(page.getByTestId('coach-upload-limits')).toContainText('MP4, MOV, WebM or MKV, up to 8 GB');
    await expect(page.getByTestId('coach-upload-limits')).toContainText('last 60 days');
    const options = page.getByTestId('coach-upload-class').locator('option');
    await expect(options).toHaveText(['Choose a class', 'Saturday Morning Study', 'Harbor Rotation (rotating class)']);
    await expect(page.getByTestId('coach-upload-leader')).toHaveCount(0);
    await expect(page.getByTestId('coach-upload-replace')).toHaveCount(0);
    await capture(page, testInfo, 'u1-upload-page-leader');
  });

  test('An upload shows its progress and then its state', async ({ page }, testInfo) => {
    await useCoachApi(page, { pipelineLive: true });
    const api = await useUploadApi(page, { partDelayMs: 400 });
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-progress')).toBeVisible();
    await capture(page, testInfo, 'u2-upload-progress');
    await expect(page.getByTestId('coach-upload-sent')).toHaveText('Uploaded. Processing: the report is being prepared, no score yet.');
    expect(api.requests).toEqual([
      { classKey: 'class:saturday', sessionDate: daysAgo(2), title: 'Week 4: Romans 8', fileName: 'saturday.mp4', fileBytes: TINY_MP4.length, contentType: 'video/mp4' },
    ]);
    expect(api.puts).toHaveLength(3);
    expect(api.completes).toHaveLength(1);
    const row = page.getByTestId('coach-upload-row').first();
    await expect(row.getByTestId('coach-upload-status')).toHaveText('Processing: the report is being prepared, no score yet');
    await capture(page, testInfo, 'u3-upload-processing');
  });

  test('Past uploads show each state, a ready report links to it, and one attributed elsewhere has no link', async ({ page }, testInfo) => {
    await useCoachApi(page, { pipelineLive: true });
    await useUploadApi(page, {
      uploads: [
        view({ id: 'u-ready', status: 'ready', reportId: NEWEST_ID, title: 'Week 3' }),
        view({ id: 'u-held', status: 'held', sessionDate: daysAgo(10) }),
        view({ id: 'u-wait', status: 'waiting-for-admin', sessionDate: daysAgo(17), classKey: 'rotating:7', className: 'Harbor Rotation' }),
        view({ id: 'u-else', status: 'attributed-elsewhere', sessionDate: daysAgo(24), classKey: 'rotating:7', className: 'Harbor Rotation' }),
      ],
    });
    await page.goto('/coach/upload');
    const rows = page.getByTestId('coach-upload-row');
    await expect(rows.getByTestId('coach-upload-status')).toHaveText([
      'Report ready',
      'Held for review before it is sent',
      'Waiting for an admin to say who led this session',
      'Attributed to another leader of the class',
    ]);
    await expect(rows.nth(0).getByTestId('coach-upload-report-link')).toHaveAttribute('href', `/coach?s=${NEWEST_ID}`);
    await expect(rows.nth(3).getByTestId('coach-upload-report-link')).toHaveCount(0);
    await capture(page, testInfo, 'u4-upload-states', page.getByTestId('coach-upload-list'));
  });

  test('A failed upload says why, and Try again fills the form back in', async ({ page }, testInfo) => {
    await useCoachApi(page, { pipelineLive: true });
    await useUploadApi(page, {
      uploads: [view({ id: 'u-failed', status: 'failed', reason: 'The video is shorter than two minutes, too short to be a session', title: 'Week 2' })],
    });
    await page.goto('/coach/upload');
    const row = page.getByTestId('coach-upload-row');
    await expect(row.getByTestId('coach-upload-status')).toHaveText('Failed: The video is shorter than two minutes, too short to be a session');
    await capture(page, testInfo, 'u5-upload-failed', row);
    await row.getByTestId('coach-upload-retry').click();
    await expect(page.getByTestId('coach-upload-class')).toHaveValue('class:saturday');
    await expect(page.getByTestId('coach-upload-date')).toHaveValue(daysAgo(3));
    await expect(page.getByTestId('coach-upload-title')).toHaveValue('Week 2');
  });

  test('A part the storage refuses stops the upload and says so, and the unfinished upload can be tried again', async ({ page }) => {
    await useCoachApi(page, { pipelineLive: true });
    const api = await useUploadApi(page, {
      partStatus: 403,
      uploads: [view({ id: 'u-unfinished', status: 'uploading', title: 'Week 5' })],
    });
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toHaveText(
      'The upload stopped at part 1 of 3: the storage refused the file (403). Press Upload to go on from there.',
      { timeout: 15_000 },
    );
    expect(api.puts).toHaveLength(3);
    expect(api.completes).toEqual([]);
    const row = page.getByTestId('coach-upload-row').filter({ hasText: 'Week 5' });
    await expect(row.getByTestId('coach-upload-status')).toHaveText('Upload not finished: try again to send the file');
    await row.getByTestId('coach-upload-retry').click();
    await expect(page.getByTestId('coach-upload-title')).toHaveValue('Week 5');
  });

  test('A part that keeps failing stops the upload there, and Upload goes on from that part without starting over', async ({ page }, testInfo) => {
    await useCoachApi(page, { pipelineLive: true });
    let healed = false;
    const api = await useUploadApi(page, { partStatus: (path) => (path.endsWith('part-2') && !healed ? 500 : 200) });
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toHaveText(
      'The upload stopped at part 2 of 3: the storage refused the file (500). Press Upload to go on from there.',
      { timeout: 15_000 },
    );
    await capture(page, testInfo, 'u9-upload-stopped-at-part');
    expect(api.requests).toHaveLength(1);
    expect(api.puts.filter((p) => p.endsWith('part-2'))).toHaveLength(3);
    healed = true;
    api.puts.length = 0;
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-sent')).toHaveText('Uploaded. Processing: the report is being prepared, no score yet.');
    expect(api.requests).toHaveLength(1);
    expect(api.refreshes.length).toBeGreaterThan(0);
    expect(api.puts.map((p) => p.split('/').pop())).toEqual(['part-2', 'part-3']);
    expect(api.completes).toHaveLength(1);
    await capture(page, testInfo, 'u10-upload-resumed');
  });

  test('A finish that fails after every part is sent is tried again without sending the file again', async ({ page }) => {
    await useCoachApi(page, { pipelineLive: true });
    let completeStatus = 500;
    const api = await useUploadApi(page, { completeStatus: () => completeStatus });
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toContainText('Server error (500)', { timeout: 15_000 });
    expect(api.puts).toHaveLength(3);
    completeStatus = 200;
    api.puts.length = 0;
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-sent')).toHaveText('Uploaded. Processing: the report is being prepared, no score yet.');
    expect(api.requests).toHaveLength(1);
    expect(api.puts).toEqual([]);
    expect(api.completes).toHaveLength(2);
  });

  test('A finish refused because a part is missing in storage sends the file again on the next Upload', async ({ page }) => {
    await useCoachApi(page, { pipelineLive: true });
    let completeStatus: number | string = 'file-incomplete';
    const api = await useUploadApi(page, { completeStatus: () => completeStatus });
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toContainText('Refused (409)', { timeout: 15_000 });
    completeStatus = 200;
    api.puts.length = 0;
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-sent')).toHaveText('Uploaded. Processing: the report is being prepared, no score yet.');
    expect(api.requests).toHaveLength(2);
    expect(api.puts).toHaveLength(3);
  });

  test('A resume the server cannot answer says so and keeps the parts already sent', async ({ page }) => {
    await useCoachApi(page, { pipelineLive: true });
    let healed = false;
    let refreshStatus = 500;
    const api = await useUploadApi(page, {
      partStatus: (path) => (path.endsWith('part-2') && !healed ? 500 : 200),
      refreshStatus: () => refreshStatus,
    });
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toContainText('stopped at part 2 of 3', { timeout: 15_000 });
    healed = true;
    api.puts.length = 0;
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toContainText('Server error (500)');
    expect(api.requests).toHaveLength(1);
    expect(api.puts).toEqual([]);
    refreshStatus = 200;
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-sent')).toHaveText('Uploaded. Processing: the report is being prepared, no score yet.');
    expect(api.requests).toHaveLength(1);
    expect(api.puts.map((p) => p.split('/').pop())).toEqual(['part-2', 'part-3']);
  });

  test('A resume of an upload the server no longer has starts the file over', async ({ page }) => {
    await useCoachApi(page, { pipelineLive: true });
    let healed = false;
    const api = await useUploadApi(page, {
      partStatus: (path) => (path.endsWith('part-2') && !healed ? 500 : 200),
      refreshStatus: () => (healed ? 404 : 200),
    });
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toContainText('stopped at part 2 of 3', { timeout: 15_000 });
    healed = true;
    api.puts.length = 0;
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-sent')).toHaveText('Uploaded. Processing: the report is being prepared, no score yet.');
    expect(api.requests).toHaveLength(2);
    expect(api.puts.map((p) => p.split('/').pop())).toEqual(['part-1', 'part-2', 'part-3']);
  });

  test('Leaving the page while a file is uploading asks first', async ({ page }) => {
    await useCoachApi(page, { pipelineLive: true });
    await useUploadApi(page, { partDelayMs: 5_000 });
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-progress')).toBeVisible();
    const asked = new Promise<string>((resolve) => page.once('dialog', (d) => { resolve(d.type()); void d.dismiss(); }));
    await page.close({ runBeforeUnload: true });
    expect(await asked).toBe('beforeunload');
  });

  test('A file or date outside the limits is refused before sending', async ({ page }, testInfo) => {
    await useCoachApi(page, { pipelineLive: true });
    const api = await useUploadApi(page);
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), { name: 'saturday.m4a', mimeType: 'audio/mp4', buffer: TINY_MP4 });
    await expect(page.getByTestId('coach-upload-problem')).toHaveText('This is an audio-only file. A report needs the video of the session.');
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toContainText('audio-only');
    await capture(page, testInfo, 'u6-upload-refused-audio');

    await page.getByTestId('coach-upload-file').setInputFiles(VIDEO);
    await page.getByTestId('coach-upload-date').fill(daysAgo(61));
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toHaveText('The session date is more than 60 days ago, the furthest back an upload can be.');
    await page.getByTestId('coach-upload-date').fill(daysAgo(-1));
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toHaveText('The session date is in the future: it must be today or earlier.');
    expect(api.requests).toEqual([]);
    expect(api.puts).toEqual([]);
  });

  test('While the parallel run is on a leader is told an admin uploads for them, from the server', async ({ page }) => {
    await useCoachApi(page);
    const api = await useUploadApi(page, { refusal: 'parallel-run' });
    await page.goto('/coach/upload');
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-problem')).toHaveText(
      'Refused (409): Uploads open to leaders when the pipeline goes live. Until then an admin uploads a session for you.',
    );
    expect(api.puts).toEqual([]);
  });

  test('The reminder link opens the upload page after sign-in', async ({ page }, testInfo) => {
    await useCoachApi(page, { signedOut: true });
    await serve(page, `${API}/coach/me`, (route) => route.fulfill({ status: 401, json: { error: 'UNAUTHORIZED', message: 'Authentication required' } }));
    await page.goto('/coach/upload');
    await expect(page.getByTestId('coach-signed-out')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('redirectTo'))).toBe('/coach/upload');
    await capture(page, testInfo, 'u7-upload-signed-out');
    await page.getByTestId('coach-signin-cta').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("An admin picks a leader and replaces a leader's undelivered upload", async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true });
    const api = await useUploadApi(page, { admin: true });
    await page.goto('/coach/upload');
    await page.getByTestId('coach-upload-leader').selectOption(LEADER_ID);
    await fillForm(page, daysAgo(2), VIDEO);
    await page.getByTestId('coach-upload-replace').check();
    await capture(page, testInfo, 'u8-upload-admin-replace');
    await page.getByTestId('coach-upload-submit').click();
    await expect(page.getByTestId('coach-upload-sent')).toBeVisible();
    expect(api.requests).toEqual([expect.objectContaining({ coachId: LEADER_ID, replace: true, classKey: 'class:saturday' })]);
    expect(api.completes).toEqual(['/coach/admin/uploads/00000000-0000-4000-8000-0000000000aa/complete']);
  });
});
