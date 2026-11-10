import { afterEach, describe, expect, it, vi } from 'vitest';
import { CoachApiError, CoachAuthError, fetchCoachMe } from './coachService';
import { learning, refusalOf } from './coachLearning';

function answer(body: unknown, status: number, headers: Record<string, string> = { 'Content-Type': 'application/json' }) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), { status, headers })));
}

afterEach(() => vi.unstubAllGlobals());

describe('the coach portal over the wire', () => {
  it('turns a 403 confirm-email refusal into the confirm-email gate', async () => {
    answer({ error: 'FORBIDDEN', message: 'Confirm your email', details: { refusal: 'confirm-email' } }, 403);
    const error = await fetchCoachMe().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CoachAuthError);
    expect((error as CoachAuthError).reason).toBe('confirm_email');
  });

  it('parses an answer without a Content-Type header as JSON', async () => {
    answer({ profile: null, zoomLink: null }, 200, {});
    await expect(fetchCoachMe()).resolves.toMatchObject({ profile: null });
  });
});

describe('the learning program over the wire', () => {
  it('treats a 401 as signed out', async () => {
    answer({ error: 'UNAUTHORIZED', message: 'Sign in' }, 401);
    const error = await learning.state().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CoachAuthError);
    expect((error as CoachAuthError).reason).toBe('signed_out');
  });

  it('keeps a 403 refusal as a refusal, with its details', async () => {
    const details = { refusal: 'confirm-email', email: 'ruth@example.com', next: '/coach/learning' };
    answer({ error: 'FORBIDDEN', message: 'Confirm your email first', details }, 403);
    const error = await learning.enrol().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CoachApiError);
    expect(refusalOf(error)).toEqual({ code: 'confirm-email', message: 'Confirm your email first', details });
  });
});
