import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { primeRubricCache } from '@/hooks/useRubric';
import * as coachService from '@/services/coachService';
import type { CoachReport } from '@/services/coachService';
import CoachSessionDetail from './CoachSessionDetail';

const REPORT = {
  id: 'r1',
  date: '2026-08-29',
  dateLabel: 'August 29, 2026',
  session: 'Obadiah, Lesson 4',
  topic: 'Obadiah 1',
  score: 84,
  status: 'Strong',
  statusEmoji: '🟢',
  clusters: [],
  dimensions: [],
  bigIdeas: [],
  feedback: { headline: '', strengths: [], improvements: [], recommendations: [] },
} as unknown as CoachReport;

function renderDetail(report: CoachReport, coachId?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CoachSessionDetail report={report} delta={null} coachId={coachId} />
    </QueryClientProvider>,
  );
}

describe("an admin opening another leader's session", () => {
  beforeEach(() => primeRubricCache(null));
  afterEach(() => vi.restoreAllMocks());

  it('offers the retained recording the admin list says exists, without the self-scoped detail', async () => {
    const detail = vi.spyOn(coachService, 'fetchCoachReportDetail').mockResolvedValue(null);
    renderDetail({ ...REPORT, hasRetainedRecording: true }, 'leader');

    expect(await screen.findByTestId('coach-recording-play-r1')).toBeInTheDocument();
    expect(detail).not.toHaveBeenCalled();
  });

  it('offers nothing when the admin list says nothing is retained', async () => {
    const detail = vi.spyOn(coachService, 'fetchCoachReportDetail').mockResolvedValue(null);
    renderDetail({ ...REPORT, hasRetainedRecording: false }, 'leader');

    await Promise.resolve();
    expect(screen.queryByTestId('coach-recording-play-r1')).toBeNull();
    expect(detail).not.toHaveBeenCalled();
  });
});

describe('a leader opening their own session', () => {
  beforeEach(() => primeRubricCache(null));
  afterEach(() => vi.restoreAllMocks());

  it('learns about the retained recording from the detail, not the list', async () => {
    const detail = vi
      .spyOn(coachService, 'fetchCoachReportDetail')
      .mockResolvedValue({ ...REPORT, hasRetainedRecording: true });
    renderDetail(REPORT);

    expect(await screen.findByTestId('coach-recording-play-r1')).toBeInTheDocument();
    expect(detail).toHaveBeenCalledWith('r1');
  });
});
