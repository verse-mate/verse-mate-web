import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { CONTRACT, INVALID_REQUEST, UNMATCHED_ROUTE, contractErrors, refusalOf } from './contract';
import { API, useCoachApi } from './fixtures';

const SOURCE = JSON.parse(readFileSync(join(import.meta.dirname, 'coach-contract.source.json'), 'utf8'));
const IMPROVEMENTS = '/coach/admin/reports/r1/improvements';
const CORRECTION = '/coach/admin/reports/r1/dimensions/3';
const STALE_PARTIAL =
  "Refused: the report was already emailed to some of its recipients, so it can no longer be corrected or edited. Its remaining sends are retried automatically. If one keeps failing, fix that recipient's address and requeue the report from the pipeline failures list. Once every recipient has it, amend it.";

test.describe("The fake API is held to the backend's contract snapshot (refresh: coach-contract.source.json)", () => {
  test('the copy names the backend commit and file it came from', () => {
    expect(SOURCE.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(SOURCE.path).toBe('packages/backend-base/src/coach/coach-contract.snapshot.json');
    expect(CONTRACT.routes.length).toBeGreaterThan(0);
    expect(Object.keys(CONTRACT.refusals).length).toBeGreaterThan(0);
  });

  test('a refusal must carry its code, status and the words the server lists for it', () => {
    const partial = refusalOf('PUT /coach/admin/reports/:reportId/improvements', 'partially-delivered');
    const body = (message: string, details?: unknown) => ({ error: 'CONFLICT', message, ...(details ? { details } : {}) });
    expect(contractErrors('PUT', IMPROVEMENTS, 409, body(partial.message, { refusal: 'partially-delivered' }))).toEqual([]);
    expect(contractErrors('PUT', IMPROVEMENTS, 409, body(STALE_PARTIAL, { refusal: 'partially-delivered' }))).not.toEqual([]);
    expect(contractErrors('PUT', IMPROVEMENTS, 409, body(partial.message))).not.toEqual([]);
    expect(contractErrors('PUT', IMPROVEMENTS, 400, { ...body(partial.message, { refusal: 'partially-delivered' }), error: 'VALIDATION_ERROR' })).not.toEqual([]);
    expect(contractErrors('PUT', IMPROVEMENTS, 409, { ...body(partial.message, { refusal: 'partially-delivered' }), error: 'VALIDATION' })).not.toEqual([]);
  });

  test('a 200 must hold every required field and nothing the server strips', () => {
    expect(contractErrors('POST', CORRECTION, 200, { base: 80, score: 84, status: 'Strong' })).toEqual([]);
    expect(contractErrors('POST', CORRECTION, 200, { base: 80, status: 'Strong' })).not.toEqual([]);
    expect(contractErrors('POST', CORRECTION, 200, { base: 80, score: 84, status: 'Strong', emoji: '🟢' })).not.toEqual([]);
    expect(contractErrors('POST', CORRECTION, 200, { base: '80', score: 84, status: 'Strong' })).not.toEqual([]);
  });

  test('a path with no server route answers 404, and an invalid body answers the validator 422', () => {
    expect(contractErrors('GET', '/coach/admin/nothing-here', 404, UNMATCHED_ROUTE)).toEqual([]);
    expect(contractErrors('GET', '/coach/admin/nothing-here', 200, { reports: [] })).not.toEqual([]);
    expect(contractErrors('GET', '/user/profile', 200, {})).not.toEqual([]);
    expect(contractErrors('PUT', IMPROVEMENTS, 422, INVALID_REQUEST)).toEqual([]);
    expect(contractErrors('PUT', IMPROVEMENTS, 422, { error: 'VALIDATION', message: 'Expected improvements' })).not.toEqual([]);
  });

  test('the fake answers a path the server has no route for with a 404', async ({ page }) => {
    await useCoachApi(page, { admin: true });
    for (const path of ['/coach/admin/no-such-route', '/coach/reports/x/no-such-route', '/user/no-such-route']) {
      const res = await page.goto(`${API}${path}`);
      expect(res?.status(), path).toBe(404);
    }
    const res = await page.goto(`${API}/coach/admin/no-such-route`);
    expect(await res?.json()).toEqual(UNMATCHED_ROUTE);
  });
});
