import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearTokens, setAccessToken } from './api';
import { fetchPendingEmail, updateAuthProfile } from './bibleService';

const ORIGINAL_FETCH = global.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let calls: Array<{ url: string; init?: RequestInit }> = [];
function mockFetch(router: (url: string, init?: RequestInit) => Response) {
  calls = [];
  global.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    calls.push({ url, init });
    return Promise.resolve(router(url, init));
  }) as typeof fetch;
}

const user = { id: 'u1', email: 'old@example.com', firstName: 'A', lastName: 'B', hasPassword: true };

describe('pending email', () => {
  beforeEach(() => setAccessToken('token'));
  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    clearTokens();
  });

  it('updateAuthProfile returns the pending address of the save', async () => {
    mockFetch(() => jsonResponse({ ...user, pendingEmail: 'new@example.com' }));
    await expect(
      updateAuthProfile({ firstName: 'A', lastName: 'B', email: 'new@example.com' }),
    ).resolves.toBe('new@example.com');
    expect(new URL(calls[0].url).pathname).toBe('/auth/profile');
    expect(calls[0].init?.method).toBe('PUT');
  });

  it('updateAuthProfile returns null when nothing is pending', async () => {
    mockFetch(() => jsonResponse({ ...user, pendingEmail: null }));
    await expect(
      updateAuthProfile({ firstName: 'A', lastName: 'B', email: 'old@example.com' }),
    ).resolves.toBeNull();
  });

  it('fetchPendingEmail reads the session', async () => {
    mockFetch(() => jsonResponse({ ...user, pendingEmail: 'new@example.com' }));
    await expect(fetchPendingEmail()).resolves.toBe('new@example.com');
    expect(new URL(calls[0].url).pathname).toBe('/auth/session');
    expect(calls[0].init?.method ?? 'GET').toBe('GET');
  });

  it('fetchPendingEmail returns null when nothing is pending', async () => {
    mockFetch(() => jsonResponse({ ...user, pendingEmail: null }));
    await expect(fetchPendingEmail()).resolves.toBeNull();
  });
});
