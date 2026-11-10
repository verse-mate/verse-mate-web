import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { describeFetch, type FetchCall } from '@/test/fetchCall';
import { clearTokens, setAccessToken } from '@/api/client';
import { deleteAuthAccount, fetchCurrentUser } from './bibleService';

const ORIGINAL_FETCH = global.fetch;
let calls: FetchCall[] = [];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function route(routes: Record<string, () => Response>) {
  calls = [];
  global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = await describeFetch(input, init);
    calls.push(call);
    const handler = routes[new URL(call.url).pathname];
    return handler ? handler() : json({ message: 'not found' }, 404);
  }) as unknown as typeof fetch;
}

const me = { id: 'u1', email: 'ruth@example.com', firstName: 'Ruth', lastName: 'Moab', fullName: 'Ruth Moab', preferred_language: 'en-US' };
const session = { id: 'u1', email: 'ruth@example.com', firstName: 'Ruth', lastName: 'Moab', is_admin: false, pendingEmail: null, preferred_language: 'en-US' };

beforeEach(() => setAccessToken('session-token'));
afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  vi.unstubAllGlobals();
  clearTokens();
});

describe('the signed-in account', () => {
  it('takes whether the account has a password, and its picture, from the session', async () => {
    route({
      '/user/me': () => json(me),
      '/auth/session': () => json({ ...session, hasPassword: false, imageSrc: 'https://example.com/ruth.png' }),
    });
    const user = await fetchCurrentUser();
    expect(user.hasPassword).toBe(false);
    expect(user.avatarUrl).toBe('https://example.com/ruth.png');
  });

  it('leaves the password question open when the session cannot be read', async () => {
    route({ '/user/me': () => json(me), '/auth/session': () => json({ message: 'boom' }, 500) });
    const user = await fetchCurrentUser();
    expect(user.hasPassword).toBeUndefined();
    expect(user.avatarUrl).toBeUndefined();
  });
});

describe('deleting the account', () => {
  it('reports a wrong password without signing the user out', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, pathname: '/settings', set href(value: string) { assign(value); } });
    route({ '/auth/account': () => json({ error: 'UNAUTHORIZED', message: 'Invalid password' }, 401) });
    const result = await deleteAuthAccount('wrong');
    expect(result).toMatchObject({ ok: false, status: 401, errorCode: 'UNAUTHORIZED' });
    expect(assign).not.toHaveBeenCalled();
  });

  it("passes on the backend's reason during an email change's revert window", async () => {
    const message = 'Your email changed recently. You can delete the account after the change can no longer be reverted.';
    route({ '/auth/account': () => json({ error: 'CONFLICT', message, details: { retryAfter: 3600 } }, 409) });
    const result = await deleteAuthAccount('secret');
    expect(result).toMatchObject({ ok: false, status: 409, message });
  });

  it('sends no password for an account without one', async () => {
    route({ '/auth/account': () => json({ success: true }) });
    await expect(deleteAuthAccount(undefined)).resolves.toMatchObject({ ok: true });
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({});
  });
});
