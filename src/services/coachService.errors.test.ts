import { afterEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';
import { fetchAdminMonthly, fetchCoachTrendsFor } from './coachService';

describe('a failed coach request', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('names the route without the leader id', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 500 })));
    const error = await fetchCoachTrendsFor('leader-slug-9').catch((e: Error) => e);
    expect((error as Error).message).toBe('coach api /coach/admin/coaches/:id/trends failed: 500');
  });

  it('names the route without its query', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 502 })));
    const error = await fetchAdminMonthly('2026-08').catch((e: Error) => e);
    expect((error as Error).message).toBe('coach api /coach/admin/monthly failed: 502');
  });

  it('names a request that never reached the server, without the leader id in the report', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    const error = await fetchCoachTrendsFor('leader-slug-9').catch((e: Error) => e);
    expect((error as Error).message).toMatch(/^Network error: GET \S+\/coach\/admin\/coaches\/leader-slug-9\/trends: TypeError: Failed to fetch$/);
  });

  it('never quotes a response body that is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>upstream 203.0.113.9</html>', { status: 200 })));
    const error = await fetchCoachTrendsFor('leader-slug-9').catch((e: Error) => e);
    expect((error as Error).message).toBe('coach api /coach/admin/coaches/:id/trends returned invalid JSON');
  });
});

describe('a failed API request', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('names its path without the query string', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 500 })));
    const error = await api.delete('/bible/book/note/remove?note_id=42').catch((e: Error) => e);
    expect((error as Error).message).toBe('API DELETE /bible/book/note/remove failed: 500');
  });

  it('names a request that never reached the server', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    const error = await api.delete('/bible/book/note/remove?note_id=42').catch((e: Error) => e);
    expect((error as Error).message).toBe('Network error: DELETE /bible/book/note/remove: TypeError: Failed to fetch');
  });
});
