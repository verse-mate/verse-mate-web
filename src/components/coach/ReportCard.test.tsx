import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportCard from './ReportCard';
import type { CoachReport } from '@/services/coachService';

/** Minimal report with just the fields ReportCard reads. */
function makeReport(overrides: Partial<CoachReport> = {}): CoachReport {
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
    },
    docUrl: '',
    pdfUrl: '',
    ...overrides,
  };
}

describe('ReportCard', () => {
  it('keeps the feedback collapsed until the chevron is tapped', () => {
    render(<ReportCard report={makeReport()} leaderName="Bryan Bailey" />);
    // Collapsed: header identity is visible…
    expect(screen.getByText('July 16, 2026')).toBeInTheDocument();
    // …but no feedback prose yet.
    expect(screen.queryByText('Top Strengths')).not.toBeInTheDocument();
  });

  it('renders the full prose (not just terse bullets) when expanded', () => {
    render(
      <ReportCard
        report={makeReport({
          feedback: {
            headline: 'A strong session.',
            strengths: ['Strong cross-referencing anchored the discussion.'],
            improvements: ['Leader talk crowded out discussion.'],
            recommendations: ['Hold silence for a full 5 seconds.'],
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
          },
        })}
        leaderName="Bryan Bailey"
      />,
    );

    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // The full prose block — title + both paragraphs + overview narrative.
    expect(screen.getByText(/landed strongest in scripture engagement/)).toBeInTheDocument();
    expect(screen.getByText('Exceptional discussion balance')).toBeInTheDocument();
    expect(screen.getByText(/talk ratio during discussion was ~32%/)).toBeInTheDocument();
    expect(screen.getByText(/the group carried it/)).toBeInTheDocument();
    // The terse strengths bullet is replaced by the prose, not shown alongside.
    expect(screen.queryByText('Strong cross-referencing anchored the discussion.')).not.toBeInTheDocument();
  });

  it('renders additional pipeline sections (key moments) when expanded', () => {
    render(
      <ReportCard
        report={makeReport({
          sections: [
            {
              title: 'Key moments',
              moments: [
                { timestamp: '[50:03]', detail: 'The leader shared a personal coping mechanism for suffering.' },
              ],
            },
          ],
        })}
        leaderName="Bryan Bailey"
      />,
    );

    fireEvent.click(screen.getByRole('button', { expanded: false }));

    expect(screen.getByText('Key moments')).toBeInTheDocument();
    expect(screen.getByText('[50:03]')).toBeInTheDocument();
    expect(screen.getByText(/personal coping mechanism/)).toBeInTheDocument();
  });
});
