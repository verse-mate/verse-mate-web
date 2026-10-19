import { afterEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SessionNotes from './SessionNotes';
import * as coachService from '@/services/coachService';
import type { CoachReport } from '@/services/coachService';
import { REPLAY_BLOCK_CLASS } from '@/lib/analyticsPrivacy';

/** Minimal report carrying just what SessionNotes reads. */
function makeReport(over: Partial<CoachReport> = {}): CoachReport {
  return {
    id: 'r1',
    date: '2026-07-16',
    dateLabel: 'July 16, 2026',
    session: 'James, Lesson 9',
    topic: 'Wealth',
    duration: '58 min',
    attendees: 9,
    newcomers: 1,
    score: 79,
    base: 79,
    newcomerBonus: 0,
    sizeBonus: 0,
    status: 'Strong',
    statusEmoji: '🟢',
    clusters: [],
    dimensions: [],
    bigIdeas: [],
    feedback: { headline: '', strengths: [], improvements: [], recommendations: [] },
    ...over,
  };
}

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('SessionNotes', () => {
  it('renders nothing for a leader with no recording and no notes', () => {
    const { container } = renderWithClient(<SessionNotes report={makeReport()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the recording link and notes read-only for a leader', () => {
    renderWithClient(
      <SessionNotes
        report={makeReport({
          recordingUrl: 'https://zoom.us/rec/abc',
          attachedRecordingUrl: 'https://zoom.us/rec/abc',
          notes: [
            { id: 'n1', body: 'Strong session — keep it up.', createdAt: '2026-07-21T00:00:00.000Z', emailed: true },
          ],
        })}
        leaderName="Milo Kerr"
      />,
    );
    expect(screen.getByText('Watch the recording')).toHaveAttribute('href', 'https://zoom.us/rec/abc');
    expect(screen.getByText('Strong session — keep it up.')).toBeInTheDocument();
    expect(screen.getByText(/emailed to leader/)).toBeInTheDocument();
    // No composer for a leader.
    expect(screen.queryByTestId('coach-note-input-r1')).not.toBeInTheDocument();
  });

  it('shows the recording editor and note composer for an admin', () => {
    renderWithClient(
      <SessionNotes report={makeReport()} admin coachId="milo-kerr" leaderName="Milo Kerr" />,
    );
    expect(screen.getByTestId('coach-note-input-r1')).toBeInTheDocument();
    expect(screen.getByTestId('coach-note-send-r1')).toBeInTheDocument();
    expect(screen.getByTestId('coach-recording-edit-r1')).toBeInTheDocument();
  });

  it('offers the retained recording when the only link is the leader meeting link', () => {
    renderWithClient(
      <SessionNotes
        report={makeReport({
          recordingUrl: 'https://zoom.us/j/5551234567',
          attachedRecordingUrl: null,
          hasRetainedRecording: true,
        })}
        admin
        coachId="milo-kerr"
      />,
    );
    expect(screen.getByTestId('coach-recording-play-r1')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /watch the recording/i })).not.toBeInTheDocument();
  });

  it('never labels the meeting link a recording for a leader', () => {
    const { container } = renderWithClient(
      <SessionNotes report={makeReport({ recordingUrl: 'https://zoom.us/j/5551234567', attachedRecordingUrl: null })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps an attached recording address out of session replay, for a leader and for an admin', () => {
    const report = makeReport({ attachedRecordingUrl: 'https://zoom.us/rec/secret' });
    const blocked = (el: HTMLElement) => el.closest(`.${REPLAY_BLOCK_CLASS}`);

    const leader = renderWithClient(<SessionNotes report={report} />);
    expect(blocked(screen.getByText('Watch the recording'))).not.toBeNull();
    leader.unmount();

    renderWithClient(<SessionNotes report={report} admin coachId="milo-kerr" />);
    expect(blocked(screen.getByText('Watch the recording'))).not.toBeNull();
    fireEvent.click(screen.getByTestId('coach-recording-edit-r1'));
    expect(blocked(screen.getByTestId('coach-recording-input-r1'))).not.toBeNull();
  });

  it('shows why a note on a held report was refused, and keeps the draft', async () => {
    vi.spyOn(coachService, 'addCoachNote').mockRejectedValue(
      new coachService.CoachApiError(
        'x',
        409,
        'This report is held from its leader, so a note would email them about a report they cannot open. Release it first.',
      ),
    );
    renderWithClient(<SessionNotes report={makeReport()} admin coachId="milo-kerr" leaderName="Milo Kerr" />);
    fireEvent.change(screen.getByTestId('coach-note-input-r1'), { target: { value: 'Well done.' } });
    fireEvent.click(screen.getByTestId('coach-note-send-r1'));

    expect(await screen.findByTestId('coach-note-error-r1')).toHaveTextContent(
      'Refused (409): This report is held from its leader, so a note would email them about a report they cannot open. Release it first.',
    );
    expect(screen.getByTestId('coach-note-input-r1')).toHaveValue('Well done.');
  });
});

afterEach(() => vi.restoreAllMocks());
