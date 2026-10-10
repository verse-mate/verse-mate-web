import { expect, test, type Page } from '@playwright/test';

import { API, capture, LEADER_ID, ME, refuse, serve, useCoachApi } from './fixtures';

const GROUP = 'harbor-rotation@example.test';

type Call = { method: string; path: string; body: unknown };

async function rotatingApi(page: Page, opts: { refusal?: string } = {}) {
  const calls: Call[] = [];
  const classes: Array<{ id: number; name: string; groupEmail: string; titleMatch: string[]; leaders: { id: string; name: string; rotatingOnly: boolean }[] }> = [];
  const names: Record<string, string> = { [LEADER_ID]: ME.profile.name, 'evan-ellis': 'Evan Ellis' };
  await serve(page, (url) => url.href.startsWith(`${API}/coach/admin/rotating-classes`) || /\/coach\/admin\/leaders\/[^/]+\/rotating-only$/.test(url.pathname), (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (req.method() === 'GET') return route.fulfill({ json: { classes } });
    const body = req.postDataJSON();
    calls.push({ method: req.method(), path, body });
    if (path.endsWith('/rotating-only')) {
      const id = decodeURIComponent(path.split('/').at(-2) ?? '');
      for (const c of classes) for (const l of c.leaders) if (l.id === id) l.rotatingOnly = body.rotatingOnly;
      return route.fulfill({ json: { rotatingOnly: body.rotatingOnly } });
    }
    if (opts.refusal) return refuse(route, opts.refusal);
    const saved = { id: classes.length + 1, name: body.name, groupEmail: body.groupEmail, titleMatch: body.titleMatch, leaders: body.leaders.map((id: string) => ({ id, name: names[id] ?? id, rotatingOnly: false })) };
    classes.push(saved);
    return route.fulfill({ json: { id: saved.id } });
  });
  return calls;
}

const BOT_DUP = {
  sourceSessionId: 'ff-bot-harbor-0301',
  source: 'bot',
  coachId: LEADER_ID,
  classKey: 'class:saturday',
  title: 'Saturday Morning Study',
  sessionDate: '2031-03-01',
  duplicateOf: 'upload:00000000-0000-4000-8000-000000000001',
  against: 'upload',
  canScoreInstead: true,
};
const HOST_DUP = {
  sourceSessionId: 'upload:00000000-0000-4000-8000-000000000002',
  source: 'upload',
  coachId: 'evan-ellis',
  classKey: 'class:tuesday',
  title: 'Tuesday Night Study',
  sessionDate: '2031-02-25',
  duplicateOf: 'host-2031-02-25',
  against: 'host-report',
  canScoreInstead: false,
};

async function duplicatesApi(page: Page, opts: { scoreRefusal?: string } = {}) {
  const calls: Call[] = [];
  let list = [BOT_DUP, HOST_DUP];
  await serve(page, (url) => url.href.startsWith(`${API}/coach/admin/duplicates`), (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (req.method() === 'GET') return route.fulfill({ json: { duplicates: list } });
    calls.push({ method: req.method(), path, body: null });
    const id = decodeURIComponent(path.split('/').at(-2) ?? '');
    if (path.endsWith('/score') && opts.scoreRefusal) return refuse(route, opts.scoreRefusal);
    list = list.filter((d) => d.sourceSessionId !== id);
    return route.fulfill({ json: path.endsWith('/score') ? { queued: true } : { dismissed: true } });
  });
  return calls;
}

test.describe('Admin surfaces for rotating classes and likely duplicates (8.11)', () => {
  test('An admin marks a class as rotating, with its group address, keywords and leaders, and flags a leader as teaching only there', async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, leaderAdmin: true });
    const calls = await rotatingApi(page);
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-rotating').click();
    await page.getByTestId('coach-rotating-add').click();
    const form = page.getByTestId('coach-rotating-form');
    await form.getByTestId('coach-rotating-name').fill('Harbor Rotation');
    await form.getByTestId('coach-rotating-email').fill(GROUP);
    await form.getByTestId('coach-rotating-keywords').fill('harbor, rotation');
    await form.getByTestId('coach-rotating-save').click();
    await expect(form.getByTestId('coach-rotating-problem')).toHaveText('Choose at least one leader who takes turns.');
    await form.getByTestId(`coach-rotating-leader-${LEADER_ID}`).check();
    await form.getByTestId('coach-rotating-leader-evan-ellis').check();
    await capture(page, testInfo, 'r1-rotating-form', form);
    await form.getByTestId('coach-rotating-save').click();

    const row = page.getByTestId('coach-rotating-1');
    await expect(row).toContainText('Harbor Rotation');
    await expect(row).toContainText(`${GROUP} · keywords: harbor, rotation`);
    await row.getByTestId('coach-rotating-only-1-evan-ellis').click();
    await expect(row.getByTestId('coach-rotating-only-1-evan-ellis')).toBeChecked();
    await capture(page, testInfo, 'r2-rotating-list', row);
    expect(calls).toEqual([
      { method: 'POST', path: '/coach/admin/rotating-classes', body: { name: 'Harbor Rotation', groupEmail: GROUP, titleMatch: ['harbor', 'rotation'], leaders: [LEADER_ID, 'evan-ellis'] } },
      { method: 'PUT', path: '/coach/admin/leaders/evan-ellis/rotating-only', body: { rotatingOnly: true } },
    ]);

    await row.getByTestId('coach-rotating-edit-1').click();
    await page.getByTestId('coach-rotating-keywords').fill('harbor, rotation, harbour');
    await page.getByTestId('coach-rotating-save').click();
    expect(calls.at(-1)).toMatchObject({ method: 'PUT', path: '/coach/admin/rotating-classes/1', body: { titleMatch: ['harbor', 'rotation', 'harbour'] } });
  });

  test("A group address that is a leader's own is refused, in the server's words", async ({ page }) => {
    await useCoachApi(page, { admin: true, leaderAdmin: true });
    await rotatingApi(page, { refusal: 'address-in-use' });
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-rotating').click();
    await page.getByTestId('coach-rotating-add').click();
    await page.getByTestId('coach-rotating-name').fill('Harbor Rotation');
    await page.getByTestId('coach-rotating-email').fill(ME.profile.email);
    await page.getByTestId(`coach-rotating-leader-${LEADER_ID}`).check();
    await page.getByTestId('coach-rotating-save').click();
    await expect(page.getByTestId('coach-rotating-problem')).toHaveText(
      "Refused (409): That address is a leader's own address or another rotating class's group address",
    );
  });

  test("The bot's recording arrives after an upload, and an upload for a date the host already reported, are listed as likely duplicates", async ({ page }, testInfo) => {
    await useCoachApi(page, { admin: true, leaderAdmin: true });
    const calls = await duplicatesApi(page);
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-duplicates').click();
    const bot = page.getByTestId(`coach-duplicate-${BOT_DUP.sourceSessionId}`);
    const host = page.getByTestId(`coach-duplicate-${HOST_DUP.sourceSessionId}`);
    await expect(bot).toContainText(`${ME.profile.name} · 2031-03-01 · Saturday Morning Study`);
    await expect(bot).toContainText("The recording bot's session, after an upload for the same class and date");
    await expect(host).toContainText('Evan Ellis · 2031-02-25');
    await expect(host).toContainText('An upload for a date the old system already reported');
    await expect(host.getByTestId(`coach-duplicate-score-${HOST_DUP.sourceSessionId}`)).toHaveCount(0);
    await capture(page, testInfo, 'r3-duplicates', page.getByTestId('coach-duplicates'));

    await host.getByTestId(`coach-duplicate-dismiss-${HOST_DUP.sourceSessionId}`).click();
    await expect(host).toHaveCount(0);
    await bot.getByTestId(`coach-duplicate-score-${BOT_DUP.sourceSessionId}`).click();
    await expect(page.getByTestId('coach-duplicates-empty')).toBeVisible();
    expect(calls.map((c) => c.path)).toEqual([
      `/coach/admin/duplicates/${encodeURIComponent(HOST_DUP.sourceSessionId)}/dismiss`,
      `/coach/admin/duplicates/${BOT_DUP.sourceSessionId}/score`,
    ]);
  });

  test("An admin scores the bot session instead of the upload: refused once the upload's report was delivered", async ({ page }) => {
    await useCoachApi(page, { admin: true, leaderAdmin: true });
    await duplicatesApi(page, { scoreRefusal: 'already-delivered' });
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-duplicates').click();
    await page.getByTestId(`coach-duplicate-score-${BOT_DUP.sourceSessionId}`).click();
    await expect(page.getByTestId(`coach-duplicate-error-${BOT_DUP.sourceSessionId}`)).toHaveText(
      "Refused (409): The upload's report was already delivered, so the recording-bot session cannot replace it",
    );
  });

  test('The admin navigation reaches the upload page', async ({ page }) => {
    await useCoachApi(page, { admin: true });
    await page.goto('/coach');
    await page.getByTestId('oversight-nav-upload').click();
    await expect(page).toHaveURL(/\/coach\/upload$/);
    await expect(page.getByTestId('coach-upload-leader')).toBeVisible();
  });
});
