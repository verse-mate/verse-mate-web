// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import worker from '../../worker.js';
import { context, edgeEnv, fakeData, installEdgeGlobals, SHELL } from './testing/fakeEdge';

const HOUR = 60 * 60 * 1000;
let now = Date.UTC(2026, 10, 9, 12);

beforeEach(() => {
  now = Date.UTC(2026, 10, 9, 12);
  vi.spyOn(Date, 'now').mockImplementation(() => now);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function get(path: string, env: Record<string, unknown> = {}) {
  const ctx = context();
  const response = await worker.fetch(new Request(`https://app.versemate.org${path}`), edgeEnv(env), ctx);
  return { response, body: await response.text(), ctx };
}

const pageEntries = (entries: Map<string, Response>) => [...entries.keys()].filter((key) => !key.includes('/__edge-cache/api/'));

describe('the edge cache', () => {
  it('serves the second visit from the cache without calling the API', async () => {
    const { api } = installEdgeGlobals();

    const first = await get('/bible/john/3');
    await first.ctx.settle();
    const callsAfterFirst = api.calls.length;
    const second = await get('/bible/john/3?utm_source=newsletter');

    expect(callsAfterFirst).toBeGreaterThan(0);
    expect(api.calls.length).toBe(callsAfterFirst);
    expect(second.body).toBe(first.body);
    expect(second.response.headers.get('content-type')).toBe('text/html; charset=utf-8');
  });

  it('keeps languages apart', async () => {
    installEdgeGlobals();

    const english = await get('/bible/john/3');
    await english.ctx.settle();
    const spanish = await get('/bible/john/3?lang=es-MX');

    expect(spanish.body).not.toBe(english.body);
    expect(spanish.body).toContain('lang="es-MX"');
  });

  it('serves the shell with 200 and stores nothing when the API fails', async () => {
    const { cache, data } = installEdgeGlobals(fakeData({ down: true }));

    const outage = await get('/bible/john/3');
    await outage.ctx.settle();

    expect(outage.response.status).toBe(200);
    expect(outage.body).toBe(SHELL);
    expect(pageEntries(cache.entries)).toEqual([]);

    data.down = false;
    const recovered = await get('/bible/john/3');
    expect(recovered.body).toContain('For God so loved the world');
  });

  it('serves a stale page at once and renders it again in the background', async () => {
    const data = fakeData();
    const { api } = installEdgeGlobals(data);
    await (await get('/bible/john/3')).ctx.settle();

    now += 25 * HOUR;
    data.explanations['43:3:summary:en-US'] = '## Overview\nA corrected summary of John 3.';
    const calls = api.calls.length;
    const stale = await get('/bible/john/3');

    expect(stale.body).toContain('nighttime talk');

    await stale.ctx.settle();
    expect(api.calls.length).toBeGreaterThan(calls);
    expect((await get('/bible/john/3')).body).toContain('A corrected summary of John 3.');
  });

  it('keeps serving the stale page when the background render fails', async () => {
    const data = fakeData();
    installEdgeGlobals(data);
    await (await get('/bible/john/3')).ctx.settle();

    now += 25 * HOUR;
    data.down = true;
    await (await get('/bible/john/3')).ctx.settle();

    expect((await get('/bible/john/3')).body).toContain('nighttime talk');
  });

  it('renders again before answering once a page is older than its stale window', async () => {
    const data = fakeData();
    installEdgeGlobals(data);
    await (await get('/bible/john/3')).ctx.settle();

    now += 9 * 24 * HOUR;
    data.explanations['43:3:summary:en-US'] = '## Overview\nA rewritten summary.';

    expect((await get('/bible/john/3')).body).toContain('A rewritten summary.');
  });

  it('starts fresh for a new build', async () => {
    const { api } = installEdgeGlobals();
    await (await get('/bible/john/3')).ctx.settle();
    const calls = api.calls.length;

    await get('/bible/john/3', { CF_VERSION_METADATA: { id: 'build-2' } });

    expect(api.calls.length).toBeGreaterThan(calls);
  });

  it('keeps a page rendered without coverage only briefly', async () => {
    const data = fakeData({ coverage: 'missing' });
    const { api } = installEdgeGlobals(data);
    await (await get('/bible/john/3')).ctx.settle();

    now += 11 * 60 * 1000;
    const calls = api.calls.length;
    await get('/bible/john/3');

    expect(api.calls.length).toBeGreaterThan(calls);
  });
});

describe('the EDGE_RENDER switch', () => {
  it('serves the plain shell and calls no API when it is off', async () => {
    const { api } = installEdgeGlobals();

    for (const value of [false, 'false']) {
      const page = await get('/bible/john/3', { EDGE_RENDER: value });
      expect(page.response.status).toBe(200);
      expect(page.body).toBe(SHELL);
    }
    expect((await get('/bible/john/999', { EDGE_RENDER: false })).response.status).toBe(200);
    expect(api.calls).toEqual([]);
  });
});
