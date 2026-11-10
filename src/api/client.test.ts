import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getBibleSearch, getUserMe, postAuthLogin, deleteAuthAccount } from './generated/sdk.gen';
import { ApiError, apiClient, publicClient, quietClient, unwrap } from './client';

const calls: Request[] = [];

function respond(status: number, body: unknown = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      calls.push(request);
      return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    }),
  );
}

function setCookies(values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) document.cookie = `${name}=${value}; path=/`;
}

beforeEach(() => {
  calls.length = 0;
  window.history.replaceState(null, '', '/settings');
  setCookies({ accessToken: 'session-token' });
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('the three clients', () => {
  it('sends the session token from the signed-in clients only', async () => {
    respond(200, {});
    await getUserMe({ client: apiClient });
    await getUserMe({ client: quietClient });
    await getUserMe({ client: publicClient });
    expect(calls.map((r) => r.headers.get('Authorization'))).toEqual([
      'Bearer session-token',
      'Bearer session-token',
      null,
    ]);
  });

  it('signs out on a 401 from a reader route without asking any refresh route, even with an old refresh cookie', async () => {
    setCookies({ refreshToken: 'legacy-refresh' });
    const assign = vi.fn();
    const location = { ...window.location, pathname: '/settings', set href(value: string) { assign(value); } };
    vi.stubGlobal('location', location);
    respond(401, { error: 'UNAUTHORIZED', message: 'expired' });
    await expect(unwrap(getUserMe({ client: apiClient }))).rejects.toBeInstanceOf(ApiError);
    expect(assign).toHaveBeenCalledWith('/logout');
    expect(calls.map((r) => new URL(r.url).pathname)).toEqual(['/user/me']);
  });

  it('keeps the user signed in on a 401 from an auth route', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, pathname: '/settings', set href(value: string) { assign(value); } });
    respond(401, { error: 'UNAUTHORIZED', message: 'Invalid password' });
    await expect(unwrap(deleteAuthAccount({ client: apiClient, body: { password: 'wrong' } }))).rejects.toMatchObject({ status: 401 });
    await expect(unwrap(postAuthLogin({ client: apiClient, body: { email: 'a@b.co', password: 'x' } }))).rejects.toMatchObject({ status: 401 });
    expect(assign).not.toHaveBeenCalled();
  });

  it('never signs out from the quiet client', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, pathname: '/coach', set href(value: string) { assign(value); } });
    respond(401, {});
    await expect(unwrap(getUserMe({ client: quietClient }))).rejects.toMatchObject({ status: 401 });
    expect(assign).not.toHaveBeenCalled();
  });

  it('names the failed request without its query on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    const error = await getBibleSearch({ client: publicClient, query: { q: 'private words', bible_version: 'NASB1995' } }).catch((e: Error) => e);
    expect((error as Error).message).toBe('Network error: GET /bible/search failed: TypeError: Failed to fetch');
    expect((error as Error).message).not.toContain('?');
  });

  it('never signs a guest out: a 401 to a request without a token is not an expired session', async () => {
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, pathname: '/bible/genesis/1', set href(value: string) { assign(value); } });
    respond(401, {});
    await expect(unwrap(getUserMe({ client: apiClient }))).rejects.toMatchObject({ status: 401 });
    expect(assign).not.toHaveBeenCalled();
  });

  it('removes a legacy refresh cookie when the app starts', async () => {
    setCookies({ refreshToken: 'legacy-refresh' });
    vi.resetModules();
    await import('./client');
    expect(document.cookie).not.toContain('refreshToken');
  });
});
