import { afterEach, describe, expect, it, vi } from 'vitest';

import { GuestScopeExceededError } from '@/audio/audioApi';
import { analytics } from '@/lib/analytics';
import { CoachAuthError } from '@/services/coachService';
import { queryClient } from './queryClient';

describe('failed requests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it('reports a failed query with its name and nothing after it', async () => {
    const capture = vi.spyOn(analytics, 'captureException');
    await queryClient
      .fetchQuery({
        queryKey: ['coach', 'admin', 'reports', 'leader-77'],
        queryFn: () => Promise.reject(new Error('NOTICKET-21 query')),
        retry: false,
      })
      .catch(() => {});
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'NOTICKET-21 query' }),
      expect.objectContaining({ source: 'react-query', query_key: 'coach/admin' }),
    );
    expect(JSON.stringify(capture.mock.calls)).not.toContain('leader-77');
  });

  it('reports a failed mutation', async () => {
    const capture = vi.spyOn(analytics, 'captureException');
    await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationKey: ['coach', 'zoom-link'],
        mutationFn: () => Promise.reject(new Error('NOTICKET-21 mutation')),
      })
      .execute(undefined)
      .catch(() => {});
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'NOTICKET-21 mutation' }),
      expect.objectContaining({ source: 'react-query', mutation_key: 'coach/zoom-link' }),
    );
  });

  it.each([
    [['user-theme-preferences', '7f3c2a10-uuid'], 'user-theme-preferences'],
    [['study-labels', 'en'], 'study-labels/en'],
    [[42, 'x'], undefined],
    [[], undefined],
  ])('names %j as %s and still reports it', async (queryKey, name) => {
    const capture = vi.spyOn(analytics, 'captureException');
    await queryClient
      .fetchQuery({ queryKey, queryFn: () => Promise.reject(new Error('NOTICKET-21 key')), retry: false })
      .catch(() => {});
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture.mock.calls[0][1]?.query_key).toBe(name);
  });

  it('reports a rejection that is not an Error without its contents', async () => {
    const capture = vi.spyOn(analytics, 'captureException');
    await queryClient
      .fetchQuery({ queryKey: ['x'], queryFn: () => Promise.reject({ body: 'secret body' }), retry: false })
      .catch(() => {});
    expect(capture.mock.calls[0][0].message).toBe('Non-Error rejection: object');
    expect(JSON.stringify(capture.mock.calls)).not.toContain('secret body');
  });

  it.each([
    ['a 401', Object.assign(new Error('unauthorized'), { status: 401 })],
    ['a signed-out coach', new CoachAuthError('signed_out')],
    ['a guest past the audio limit', new GuestScopeExceededError()],
  ])('leaves out %s', async (_label, error) => {
    const capture = vi.spyOn(analytics, 'captureException');
    await queryClient
      .fetchQuery({ queryKey: ['coach', 'me'], queryFn: () => Promise.reject(error), retry: false })
      .catch(() => {});
    expect(capture).not.toHaveBeenCalled();
  });
});
