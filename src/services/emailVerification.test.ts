import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessToken } from './api';
import { confirmEmail, fetchEmailVerified, sendVerificationEmail } from './emailVerification';

const ORIGINAL_FETCH = global.fetch;
let calls: Array<{ url: string; init?: RequestInit }> = [];

function respond(status: number, body?: unknown) {
  calls = [];
  global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return Promise.resolve(new Response(body === undefined ? null : JSON.stringify(body), { status }));
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  document.cookie = 'accessToken=test-token; path=/';
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('email verification for the coaching gate', () => {
  it("reads whether the signed-in account's email is confirmed", async () => {
    respond(200, { id: 'u1', email: 'leader@example.test', emailVerified: false });
    expect(await fetchEmailVerified()).toBe(false);
    expect(calls[0].url).toMatch(/\/user\/me$/);
    respond(200, { id: 'u1', email: 'leader@example.test', emailVerified: true });
    expect(await fetchEmailVerified()).toBe(true);
  });

  it('asks the server to send the confirmation email', async () => {
    respond(204);
    await sendVerificationEmail();
    expect(calls[0].url).toMatch(/\/auth\/send-email-verification$/);
    expect(calls[0].init?.method).toBe('POST');
  });

  it('confirms with the key from the link and keeps the session the server returns', async () => {
    respond(200, { accessToken: 'new-access', refreshToken: 'new-refresh' });
    expect(await confirmEmail('k-123')).toBe('confirmed');
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ token: 'k-123' });
    expect(getAccessToken()).toBe('new-access');
  });

  it('tells an already confirmed account, a bad or expired link, and a signed-out visitor apart', async () => {
    respond(409, { error: 'CONFLICT', message: 'User already verified' });
    expect(await confirmEmail('k')).toBe('already');
    respond(400, { error: 'VALIDATION_ERROR', message: 'Invalid verification token' });
    expect(await confirmEmail('k')).toBe('invalid');
    respond(409, { error: 'CONFLICT', message: 'Verification link already used' });
    expect(await confirmEmail('k')).toBe('invalid');
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    respond(200, {});
    expect(await confirmEmail('k')).toBe('signed-out');
    expect(calls).toEqual([]);
  });
});
