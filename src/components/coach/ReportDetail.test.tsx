import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportDetail from './ReportDetail';
import type { CoachReport } from '@/services/coachService';

/** Minimal report with just the fields ReportDetail reads. */
function makeReport(overrides: Partial<CoachReport['feedback']> = {}): CoachReport {
  return {
    id: 'r1',
    date: '2026-07-16',
    dateLabel: 'July 16, 2026',
    session: 'James, Lesson 9',
    topic: 'Wealth, Patience, and the Last Days',
    duration: '58 min',
    attendees: 9,
    newcomers: 1,
    score: 79,
    base: 79,
    newcomerBonus: 0,
    sizeBonus: 0,
    status: 'Strong',
    statusEmoji: '🟢',
    clusters: [{ name: 'Teaching Craft', weight: 33, scorePct: 80, contribution: 26.4 }],
    dimensions: [{ n: 1, name: 'Session Structure & Flow', score: 4, note: 'Solid blueprint.' }],
    bigIdeas: ['You can’t take it with you'],
    feedback: {
      headline: 'A strong session.',
      strengths: ['Strong cross-referencing anchored the discussion.'],
      improvements: ['Leader talk crowded out discussion.'],
      recommendations: ['Hold silence for a full 5 seconds.'],
      ...overrides,
    },
    docUrl: '',
    pdfUrl: '',
  };
}

describe('ReportDetail', () => {
  it('renders the terse bullets when the pipeline has not supplied prose', () => {
    render(<ReportDetail report={makeReport()} leaderName="Bryan Bailey" />);
    expect(screen.getByText('Strong cross-referencing anchored the discussion.')).toBeInTheDocument();
    expect(screen.getByText('Top strengths')).toBeInTheDocument();
  });

  it('renders the full prose (title + paragraphs + overview) when present', () => {
    render(
      <ReportDetail
        report={makeReport({
          overview: ['This session landed strongest in scripture engagement.'],
          strengthsProse: [
            {
              title: 'Exceptional discussion balance',
              paragraphs: [
                'The leader’s talk ratio during discussion was ~32%, near the Lifeway benchmark.',
                'The balance was not accidental — a question was posed and the group carried it.',
              ],
            },
          ],
        })}
        leaderName="Bryan Bailey"
      />,
    );
    // Overview narrative shows.
    expect(screen.getByText(/landed strongest in scripture engagement/)).toBeInTheDocument();
    // Titled prose block with both paragraphs shows.
    expect(screen.getByText('Exceptional discussion balance')).toBeInTheDocument();
    expect(screen.getByText(/talk ratio during discussion was ~32%/)).toBeInTheDocument();
    expect(screen.getByText(/the group carried it/)).toBeInTheDocument();
    // The terse strengths bullet is replaced by the prose, not shown alongside.
    expect(screen.queryByText('Strong cross-referencing anchored the discussion.')).not.toBeInTheDocument();
  });
});
