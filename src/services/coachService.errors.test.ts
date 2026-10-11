import { afterEach, describe, expect, it, vi } from 'vitest';

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
});
