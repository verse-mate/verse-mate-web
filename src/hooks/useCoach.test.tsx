import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as coachService from '@/services/coachService';
import type { CoachReportSummary, LeaderMonthlyResponse } from '@/services/coachService';
import { useCoachReportSummaries, useLeaderMonthlySummary } from './useCoach';

function monthlyFor(id: string, name: string): LeaderMonthlyResponse {
  return {
    profile: { id, name, group: '' },
    summary: null,
    availableMonths: ['2026-08', '2026-07'],
  } as unknown as LeaderMonthlyResponse;
}

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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
});
