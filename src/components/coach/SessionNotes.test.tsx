import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SessionNotes from './SessionNotes';
import type { CoachReport } from '@/services/coachService';

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
    docUrl: '',
    pdfUrl: '',
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
          notes: [
            { id: 'n1', body: 'Strong session — keep it up.', createdAt: '2026-07-21T00:00:00.000Z', emailed: true },
          ],
        })}
        leaderName="Jeff Ward"
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
      <SessionNotes report={makeReport()} admin coachId="jeff-ward" leaderName="Jeff Ward" />,
    );
    expect(screen.getByTestId('coach-note-input-r1')).toBeInTheDocument();
    expect(screen.getByTestId('coach-note-send-r1')).toBeInTheDocument();
    expect(screen.getByTestId('coach-recording-edit-r1')).toBeInTheDocument();
  });
});
