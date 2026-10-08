import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as coachService from '@/services/coachService';
import type { CoachReport, CoachReportSummary } from '@/services/coachService';
import CoachLeaderScreen from './CoachLeaderScreen';

vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: () => true }));
vi.mock('@/components/coach/ReportDetail', () => ({
  default: ({ report }: { report: CoachReport }) => <div data-testid="selected-report">{report.id}</div>,
}));
vi.mock('@/components/coach/ReportCard', () => ({ default: () => null }));
vi.mock('@/components/coach/CoachProfileAvatar', () => ({ default: () => null }));
vi.mock('@/components/coach/CoachTrendCharts', () => ({
  ScoreTrendCard: ({ onSelectDate }: { onSelectDate: (d: string, reportId?: string) => void }) => (
    <>
      <button type="button" data-testid="trend-point-2026-01-05" onClick={() => onSelectDate('2026-01-05')} />
      <button type="button" data-testid="trend-point-r9" onClick={() => onSelectDate('2025-06-28', 'r9')} />
    </>
  ),
  ClusterTrendCard: () => null,
}));

const summary = (id: string, date: string) =>
  ({ id, date, dateLabel: date, session: id, topic: '', score: 80, status: 'Strong', statusEmoji: '' }) as CoachReportSummary;
const detail = (id: string) => ({ id, date: '', dimensions: [], notes: [] }) as unknown as CoachReport;

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/coach/leader/avery/manage']}>
        <Routes>
          <Route path="/coach/leader/:coachId/manage" element={<CoachLeaderScreen />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.spyOn(coachService, 'fetchAdminCoaches').mockResolvedValue([]);
  vi.spyOn(coachService, 'fetchAllCoachClasses').mockResolvedValue([]);
  vi.spyOn(coachService, 'fetchCoachTrendsFor').mockResolvedValue({
    scoreSeries: [],
    clusterSeries: [],
    dimensionSeries: [],
    delta: null,
  });
  vi.spyOn(coachService, 'fetchCoachReportDetail').mockImplementation(async (id) => detail(id));
});

afterEach(() => vi.restoreAllMocks());

describe('the management screen', () => {
  it('keeps the page and says so when more sessions fail to load', async () => {
    vi.spyOn(coachService, 'fetchCoachReportSummaries')
      .mockResolvedValueOnce({
        items: [summary('r1', '2026-03-01'), summary('r2', '2026-02-01')],
        total: 3,
        streakWeeks: 0,
        quarterSessions: 0,
      })
      .mockRejectedValueOnce(new coachService.CoachApiError('admin/coaches/avery/reports/summary', 500, ''));
    renderScreen();

    fireEvent.click(await screen.findByTestId('coach-leader-more'));

    expect(await screen.findByTestId('coach-leader-more-failed')).toHaveTextContent('Could not load more sessions');
    expect(screen.getByTestId('selected-report')).toHaveTextContent('r1');
    expect(screen.getByTestId('coach-leader-more')).not.toBeDisabled();
  });
});

describe('a trend point on the management screen', () => {
  it('opens its session even when that session is not on a loaded page', async () => {
    const pages = vi
      .spyOn(coachService, 'fetchCoachReportSummaries')
      .mockResolvedValueOnce({
        items: [summary('r1', '2026-03-01'), summary('r2', '2026-02-01')],
        total: 3,
        streakWeeks: 0,
        quarterSessions: 0,
      })
      .mockResolvedValueOnce({ items: [summary('r3', '2026-01-05')], total: 3, streakWeeks: 0, quarterSessions: 0 });
    renderScreen();

    expect(await screen.findByTestId('selected-report')).toHaveTextContent('r1');
    fireEvent.click(screen.getByTestId('trend-point-2026-01-05'));

    await waitFor(() => expect(screen.getByTestId('selected-report')).toHaveTextContent('r3'));
    expect(pages).toHaveBeenLastCalledWith(2, 50, 'avery');
    expect(coachService.fetchCoachReportDetail).toHaveBeenCalledWith('r3', 'avery');
  });
});

describe('a trend point that carries its report id', () => {
  it('opens that report directly, without paging the summaries', async () => {
    const pages = vi.spyOn(coachService, 'fetchCoachReportSummaries').mockResolvedValue({
      items: [summary('r1', '2026-03-01')],
      total: 60,
      streakWeeks: 0,
      quarterSessions: 0,
    });
    renderScreen();

    expect(await screen.findByTestId('selected-report')).toHaveTextContent('r1');
    fireEvent.click(screen.getByTestId('trend-point-r9'));

    await waitFor(() => expect(screen.getByTestId('selected-report')).toHaveTextContent('r9'));
    expect(coachService.fetchCoachReportDetail).toHaveBeenCalledWith('r9', 'avery');
    expect(pages).toHaveBeenCalledTimes(1);
  });

  it('takes the id from the score series when the clicked chart row has none', async () => {
    vi.spyOn(coachService, 'fetchCoachTrendsFor').mockResolvedValue({
      scoreSeries: [{ date: '2026-01-05', dateLabel: '', session: '', score: 70, status: '', reportId: 'r7' }],
      clusterSeries: [],
      dimensionSeries: [],
      delta: null,
    });
    const pages = vi.spyOn(coachService, 'fetchCoachReportSummaries').mockResolvedValue({
      items: [summary('r1', '2026-03-01')],
      total: 60,
      streakWeeks: 0,
      quarterSessions: 0,
    });
    renderScreen();

    expect(await screen.findByTestId('selected-report')).toHaveTextContent('r1');
    await waitFor(() => expect(coachService.fetchCoachTrendsFor).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 0));
    fireEvent.click(screen.getByTestId('trend-point-2026-01-05'));

    await waitFor(() => expect(screen.getByTestId('selected-report')).toHaveTextContent('r7'));
    expect(pages).toHaveBeenCalledTimes(1);
  });
});
