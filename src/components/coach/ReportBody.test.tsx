import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ReportBody from './ReportBody';
import type { CoachReport } from '@/services/coachService';

function report(sections: CoachReport['sections']): CoachReport {
  return {
    id: 'r1',
    date: '2026-10-01',
    dateLabel: '2026-10-01',
    session: 'Jonah, Week 2',
    topic: 'The reluctant prophet',
    duration: '90 min',
    attendees: 12,
    newcomers: 1,
    score: 80,
    base: 80,
    newcomerBonus: 0,
    sizeBonus: 0,
    status: 'Strong',
    statusEmoji: '🟢',
    clusters: [],
    dimensions: [],
    bigIdeas: ['God pursues the one who runs'],
    feedback: { headline: 'A room that opened up', strengths: [], improvements: [], recommendations: [] },
    sections,
  };
}

describe('Report identifies its session', () => {
  it('a machine report opens with its title page: the rows in order and a context line, before the summary', () => {
    render(
      <ReportBody
        report={report([
          { title: 'Scorecard — Table 1', bullets: ['Number of Attendees: 12  (Target: —)  → N/A'] },
          {
            title: 'Session Details',
            bullets: ['Date: 2026-10-01', 'Session: Jonah, Week 2', 'Location: Fellowship hall', 'Books Studied: Jonah 1'],
            paragraphs: ['An honest session where a hard confession changed the room.'],
          },
        ])}
      />,
    );
    const title = screen.getByTestId('coach-report-title-page');
    expect(within(title).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Date2026-10-01',
      'SessionJonah, Week 2',
      'LocationFellowship hall',
      'Books StudiedJonah 1',
    ]);
    expect(title).toHaveTextContent('An honest session where a hard confession changed the room.');
    expect(title.compareDocumentPosition(screen.getByText('Summary & Big Ideas')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText('Session Details')).toBeNull();
  });

  it('A backfilled report lacks the newer title rows: no title page and no empty rows', () => {
    render(<ReportBody report={report([{ title: 'Scorecard — Table 1', bullets: ['Number of Attendees: 12  (Target: —)  → N/A'] }])} />);
    expect(screen.queryByTestId('coach-report-title-page')).toBeNull();
  });
});

describe('A strength or improvement shows its evidence', () => {
  it('the quote and the time it was said follow the point', () => {
    const r = report([]);
    r.feedback = {
      ...r.feedback,
      strengthsProse: [
        {
          title: 'Scripture first',
          paragraphs: ['You opened with the passage.'],
          evidence: { quote: "Let's read it before we talk", timestamp: '00:03:12' },
        },
      ],
    };
    render(<ReportBody report={r} />);
    expect(screen.getByTestId('coach-point-evidence')).toHaveTextContent("“Let's read it before we talk” at 00:03:12");
  });
});
