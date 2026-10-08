import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as coachService from '@/services/coachService';
import type { CoachReportSummary, CoachSummary, LeaderMonthlyResponse } from '@/services/coachService';
import {
  coachKeys,
  coachState,
  useAdminLeader,
  useAmendReport,
  useAttributeSession,
  useCoachReportSummaries,
  useLeaderMonthlySummary,
  useReleaseHeldReport,
  useSendRevision,
} from './useCoach';

function monthlyFor(id: string, name: string): LeaderMonthlyResponse {
  return {
    profile: { id, name, group: '' },
    summary: null,
    availableMonths: ['2026-08', '2026-07'],
  } as unknown as LeaderMonthlyResponse;
}

function wrapper(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

afterEach(() => vi.restoreAllMocks());

describe("a leader's monthly summary while navigating", () => {
  it("never shows the previous leader's data under the next leader", async () => {
    vi.spyOn(coachService, 'fetchLeaderMonthlySummary').mockImplementation((id) =>
      id === 'alice' ? Promise.resolve(monthlyFor('alice', 'Alice Adams')) : new Promise(() => {}),
    );

    const { result, rerender } = renderHook(
      ({ id, month }) => useLeaderMonthlySummary(id, month),
      { wrapper: wrapper(), initialProps: { id: 'alice', month: '2026-08' } },
    );
    await waitFor(() => expect(result.current.data?.profile.name).toBe('Alice Adams'));

    rerender({ id: 'bob', month: '2026-08' });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it("keeps the same leader's data on screen while the next month loads", async () => {
    vi.spyOn(coachService, 'fetchLeaderMonthlySummary').mockImplementation((_id, month) =>
      month === '2026-08' ? Promise.resolve(monthlyFor('alice', 'Alice Adams')) : new Promise(() => {}),
    );

    const { result, rerender } = renderHook(
      ({ id, month }) => useLeaderMonthlySummary(id, month),
      { wrapper: wrapper(), initialProps: { id: 'alice', month: '2026-08' } },
    );
    await waitFor(() => expect(result.current.data?.profile.name).toBe('Alice Adams'));

    rerender({ id: 'alice', month: '2026-07' });
    expect(result.current.data?.profile.name).toBe('Alice Adams');
    expect(result.current.isPlaceholderData).toBe(true);
  });
});

describe("a leader's paginated history", () => {
  it('stops paging when the server returns an empty page short of its own total', async () => {
    const item = (id: string) => ({ id }) as CoachReportSummary;
    const fetch = vi.spyOn(coachService, 'fetchCoachReportSummaries').mockImplementation((offset = 0) =>
      Promise.resolve({
        items: offset === 0 ? [item('a'), item('b')] : [],
        total: 3,
        streakWeeks: 0,
        quarterSessions: 0,
      }),
    );

    const { result } = renderHook(() => useCoachReportSummaries(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.hasNextPage).toBe(false);
    await act(() => result.current.fetchNextPage());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('a failed next page is not a failure of the page already shown', async () => {
    const item = (id: string) => ({ id }) as CoachReportSummary;
    vi.spyOn(coachService, 'fetchCoachReportSummaries').mockImplementation((offset = 0) =>
      offset === 0
        ? Promise.resolve({ items: [item('a')], total: 2, streakWeeks: 0, quarterSessions: 0 })
        : Promise.reject(new coachService.CoachApiError('reports/summary', 500, '')),
    );

    const { result } = renderHook(
      () => {
        const query = useCoachReportSummaries();
        return { query, state: coachState(query) };
      },
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.query.hasNextPage).toBe(true));
    await act(() => result.current.query.fetchNextPage());
    await waitFor(() => expect(result.current.query.isFetching).toBe(false));

    expect(result.current.query.isFetchNextPageError).toBe(true);
    expect(result.current.state.error).toBe(false);
    expect(result.current.state.data?.pages[0].items).toEqual([item('a')]);
  });
});

describe("a leader's summaries under the admin drill-in", () => {
  it("never shows one leader's sessions under another, or under the signed-in leader's own", async () => {
    const item = (id: string) => ({ id }) as CoachReportSummary;
    vi.spyOn(coachService, 'fetchCoachReportSummaries').mockImplementation((_offset = 0, _limit, coachId) =>
      Promise.resolve({ items: [item(coachId ?? 'self')], total: 1, streakWeeks: 0, quarterSessions: 0 }),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result, rerender } = renderHook(({ coachId }) => useCoachReportSummaries({ coachId }), {
      wrapper: wrapper(client),
      initialProps: { coachId: 'alice' as string | undefined },
    });
    await waitFor(() => expect(result.current.data?.pages[0].items).toEqual([item('alice')]));

    rerender({ coachId: 'bob' });
    await waitFor(() => expect(result.current.data?.pages[0].items).toEqual([item('bob')]));

    rerender({ coachId: undefined });
    await waitFor(() => expect(result.current.data?.pages[0].items).toEqual([item('self')]));
  });
});

describe('the leader an admin drilled into', () => {
  it('is the roster row with that id, not the first one', async () => {
    const leader = (id: string, name: string) => ({ id, name }) as CoachSummary;
    vi.spyOn(coachService, 'fetchAdminCoaches').mockResolvedValue([leader('alice', 'Alice Adams'), leader('bob', 'Bob Brown')]);

    const { result } = renderHook(() => useAdminLeader('bob'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current?.name).toBe('Bob Brown'));
  });
});

describe('what an amendment or a send refreshes', () => {
  const ADMIN_DETAIL = [...coachKeys.adminReports('leader'), 'detail', 'rep-1'];
  const ADMIN_SUMMARY = [...coachKeys.adminReports('leader'), 'summary'];
  const OWN_DETAIL = [...coachKeys.reports, 'detail', 'rep-1'];
  const TRENDS = coachKeys.adminTrends('leader');
  const REVIEW = coachKeys.reportReview('rep-1');
  const REVISIONS = coachKeys.reportRevisions('rep-1');
  const OTHER_LEADER = [...coachKeys.adminReports('someone-else'), 'detail', 'rep-9'];
  const ALL = [ADMIN_DETAIL, ADMIN_SUMMARY, OWN_DETAIL, TRENDS, REVIEW, REVISIONS, OTHER_LEADER];

  function seeded() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    for (const key of ALL) client.setQueryData(key, { cached: true });
    return client;
  }
  const stale = (client: QueryClient, key: readonly unknown[]) => client.getQueryState(key)?.isInvalidated;

  it("marks the report, its review, its versions, the leader's lists and trends stale after an applied amendment", async () => {
    vi.spyOn(coachService, 'amendReport').mockResolvedValue({ applied: true, revision: 1 });
    const client = seeded();
    const { result } = renderHook(() => useAmendReport('leader', 'rep-1'), { wrapper: wrapper(client) });

    await act(() => result.current.mutateAsync({ body: { headline: 'x' } }));

    for (const key of [ADMIN_DETAIL, ADMIN_SUMMARY, OWN_DETAIL, TRENDS, REVIEW, REVISIONS]) expect(stale(client, key)).toBe(true);
    expect(stale(client, OTHER_LEADER)).toBe(false);
  });

  it('leaves the cache alone when the amendment was refused', async () => {
    vi.spyOn(coachService, 'amendReport').mockResolvedValue({ applied: false, refusal: 'governance-blocked' });
    const client = seeded();
    const { result } = renderHook(() => useAmendReport('leader', 'rep-1'), { wrapper: wrapper(client) });

    await act(() => result.current.mutateAsync({ body: { headline: 'x' } }));

    for (const key of ALL) expect(stale(client, key)).toBe(false);
  });

  it('refreshes the kept versions after a send, and after a send that failed', async () => {
    const send = vi.spyOn(coachService, 'sendRevision').mockResolvedValueOnce({ sent: true, revision: 1 });
    const client = seeded();
    const { result } = renderHook(() => useSendRevision('leader', 'rep-1'), { wrapper: wrapper(client) });

    await act(() => result.current.mutateAsync());
    for (const key of [REVISIONS, ADMIN_DETAIL, TRENDS]) expect(stale(client, key)).toBe(true);

    for (const key of ALL) client.setQueryData(key, { cached: true });
    send.mockRejectedValueOnce(new coachService.CoachApiError('x', 500, ''));
    await act(() => result.current.mutateAsync().catch(() => undefined));
    expect(stale(client, REVISIONS)).toBe(true);
  });
});

describe('what a release or an assignment refreshes', () => {
  const FAILURES = [...coachKeys.pipelineFailures, 0];
  const KEYS = [
    FAILURES,
    [...coachKeys.adminReports('leader'), 'summary'],
    [...coachKeys.adminReports('other'), 'detail', 'rep-1'],
    coachKeys.adminTrends('other'),
    coachKeys.reportReview('rep-1'),
    coachKeys.reportRevisions('rep-1'),
  ];

  function seeded() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    for (const key of KEYS) client.setQueryData(key, { cached: true });
    return client;
  }
  const stale = (client: QueryClient, key: readonly unknown[]) => client.getQueryState(key)?.isInvalidated;

  it.each([
    ['delivered', { delivered: true }],
    ['not delivered', { delivered: false, refusal: 'cold-recall-improvement', coldRecall: ['x'] }],
  ])('a release that was %s marks the list, every leader report, the review and its versions stale', async (_name, outcome) => {
    vi.spyOn(coachService, 'releaseHeldReport').mockResolvedValue(outcome);
    const client = seeded();
    const { result } = renderHook(() => useReleaseHeldReport(), { wrapper: wrapper(client) });
    await act(() => result.current.mutateAsync('rep-1'));
    for (const key of KEYS) expect(stale(client, key)).toBe(true);
  });

  it('an assignment marks the list, every leader report, the review and its versions stale', async () => {
    vi.spyOn(coachService, 'attributeSession').mockResolvedValue({ coachId: 'other', state: 'retained' });
    const client = seeded();
    const { result } = renderHook(() => useAttributeSession(), { wrapper: wrapper(client) });
    await act(() => result.current.mutateAsync({ sourceSessionId: 'ff-1', coachId: 'other', expectedCoachId: 'leader' }));
    for (const key of KEYS) expect(stale(client, key)).toBe(true);
  });
});
