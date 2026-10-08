import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
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
