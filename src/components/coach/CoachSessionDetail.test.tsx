import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
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
    expect(detail).toHaveBeenCalledWith('r1', undefined);
  });
});

describe('a leader who saved a meeting link', () => {
  beforeEach(() => primeRubricCache(null));
  afterEach(() => vi.restoreAllMocks());

  const withMeetingLink = {
    ...REPORT,
    recordingUrl: 'https://zoom.us/j/5551234567',
    attachedRecordingUrl: null,
  } as CoachReport;

  it('still has the retained recording offered, not the meeting link', async () => {
    vi.spyOn(coachService, 'fetchCoachReportDetail').mockResolvedValue({
      ...withMeetingLink,
      hasRetainedRecording: true,
    });
    renderDetail(withMeetingLink);

    expect(await screen.findByTestId('coach-recording-play-r1')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-recording-attached-r1')).toBeNull();
  });

  it('has the retained recording offered to an admin', async () => {
    renderDetail({ ...withMeetingLink, hasRetainedRecording: true }, 'leader');

    expect(await screen.findByTestId('coach-recording-play-r1')).toBeInTheDocument();
    expect(screen.queryByTestId('coach-recording-attached-r1')).toBeNull();
  });

  it('shows an attached link over the retained recording', async () => {
    renderDetail(
      {
        ...withMeetingLink,
        attachedRecordingUrl: 'https://drive.example.test/rec.mp4',
        hasRetainedRecording: true,
      },
      'leader',
    );

    expect(await screen.findByTestId('coach-recording-attached-r1')).toHaveAttribute(
      'href',
      'https://drive.example.test/rec.mp4',
    );
  });
});

describe('the full session metrics', () => {
  beforeEach(() => primeRubricCache(null));
  afterEach(() => vi.restoreAllMocks());

  const SCORED = {
    ...REPORT,
    score: 81.1,
    base: 78.1,
    newcomerBonus: 2,
    sizeBonus: 1,
    clusters: [{ name: 'Teaching Craft', weight: 33, scorePct: 80, contribution: 26.4 }],
    dimensions: [{ n: 1, name: 'Scripture Anchoring', score: 4, note: 'Stayed in the text.' }],
  } as unknown as CoachReport;

  it('are linked from the report rather than inlined, and lead with the score composition before the detailed sections', async () => {
    vi.spyOn(coachService, 'fetchCoachReportDetail').mockResolvedValue(null);
    renderDetail(SCORED, 'leader');

    expect(screen.queryByTestId('coach-score-composition')).toBeNull();
    expect(screen.queryByText('Teaching Craft')).toBeNull();
    const pointer = screen.getByTestId('coach-metrics-link');
    expect(pointer).not.toHaveTextContent('Nothing is held back');
    expect(pointer).not.toHaveTextContent('sections above');

    fireEvent.click(within(pointer).getByRole('button', { name: 'Open the full metrics' }));
    const composition = screen.getByTestId('coach-score-composition');
    expect(composition).toHaveTextContent('Teaching Craft');
    expect(composition).toHaveTextContent('Base 78.1 + newcomer growth 2 + group size 1 = 81.1 / 100');
    const firstDimension = screen.getByTestId('coach-dim-1');
    expect(composition.compareDocumentPosition(firstDimension) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('still lead with the score composition when no dimension scorecard is available yet', async () => {
    vi.spyOn(coachService, 'fetchCoachReportDetail').mockResolvedValue(null);
    renderDetail({ ...SCORED, dimensions: [], newcomerBonus: 0, sizeBonus: 0, score: 78.1 } as CoachReport, 'leader');
    fireEvent.click(screen.getByTestId('coach-tab-scorecard'));
    expect(screen.getByTestId('coach-score-composition')).toHaveTextContent('Base 78.1 = 78.1 / 100');
    expect(screen.getByText('No dimension scorecard is available for this session yet.')).toBeInTheDocument();
  });
});

describe('an uploaded session with no head count', () => {
  beforeEach(() => primeRubricCache(null));
  afterEach(() => vi.restoreAllMocks());

  it('reads attendance not recorded in the session snapshot, never null', async () => {
    vi.spyOn(coachService, 'fetchCoachReportDetail').mockResolvedValue(null);
    const { container } = renderDetail({ ...REPORT, attendees: null, duration: '62 min' });
    expect(container.textContent).not.toContain('null');
    expect(container.textContent).toContain('Not recorded');
  });
});
