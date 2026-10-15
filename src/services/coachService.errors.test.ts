import { afterEach, describe, expect, it, vi } from 'vitest';

import { scrubEvent } from '@/lib/analyticsPrivacy';
import { requestAudio } from '@/audio/audioApi';
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
    const sent = scrubEvent({ uuid: 'u', event: '$exception', properties: { value: (error as Error).message } });
    expect(sent?.properties.value).toBe('Network error: GET /coach/admin/coaches/:id/trends failed: TypeError: Failed to fetch');
  });

  it('lets a cancelled request through as it is', async () => {
    const abort = new DOMException('The operation was aborted.', 'AbortError');
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(abort)));
    const error = await fetchCoachTrendsFor('leader-slug-9').catch((e: Error) => e);
    expect(error).toBe(abort);
  });

  it('never quotes a response body that is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>upstream 203.0.113.9</html>', { status: 200 })));
    const error = await fetchCoachTrendsFor('leader-slug-9').catch((e: Error) => e);
    expect((error as Error).message).toBe('coach api /coach/admin/coaches/:id/trends returned invalid JSON');
  });

  it('never quotes an audio response body that is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>upstream 203.0.113.9</html>', { status: 200 })));
    const error = await requestAudio({ explanationId: 1 }).catch((e: Error) => e);
    expect((error as Error).message).toBe('Audio request returned invalid JSON');
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
    expect((error as Error).message).toBe('Network error: DELETE /bible/book/note/remove failed: TypeError: Failed to fetch');
  });
});
