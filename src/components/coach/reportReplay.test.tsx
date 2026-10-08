import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toaster, toast } from '@/components/ui/sonner';
import { primeRubricCache } from '@/hooks/useRubric';
import { REPLAY_BLOCK_CLASS } from '@/lib/analyticsPrivacy';
import * as coachService from '@/services/coachService';
import type { CoachReport } from '@/services/coachService';
import CoachSessionDetail from './CoachSessionDetail';
import ReportCard from './ReportCard';
import ReportDetail from './ReportDetail';

const MARK = 'PRIVATE';

const REPORT: CoachReport = {
  id: 'r1',
  date: '2026-07-16',
  dateLabel: 'July 16, 2026',
  session: 'James, Lesson 9',
  topic: 'James 5',
  duration: '58 min',
  attendees: 9,
  newcomers: 1,
  score: 79,
  base: 79,
  newcomerBonus: 0,
  sizeBonus: 0,
  status: 'Strong',
  statusEmoji: '',
  clusters: [{ name: 'Teaching Craft', weight: 33, scorePct: 80, contribution: 26.4 }],
  dimensions: [{ n: 1, name: 'Session Structure & Flow', score: 4, note: `${MARK} rationale for dimension one` }],
  bigIdeas: [`${MARK} big idea`],
  feedback: {
    headline: `${MARK} headline`,
    overview: [`${MARK} overview`],
    strengths: [`${MARK} strength`],
    improvements: [`${MARK} improvement`],
    recommendations: [`${MARK} recommendation`],
  },
  sections: [
    { title: 'Key moments', moments: [{ timestamp: '12:00', detail: `${MARK} moment head\n\nWhat: ${MARK} what happened` }] },
    { title: 'Application questions', bullets: [`${MARK} question — Level 3 — Strategic — ${MARK} coach note`] },
    { title: 'Drift log', paragraphs: [`${MARK} drift paragraph`] },
  ],
};

function wrap(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{children}</QueryClientProvider>);
}

function exposedReportText(): string[] {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen: string[] = [];
  const exposed: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';
    if (!text.includes(MARK)) continue;
    seen.push(text);
    if (!node.parentElement?.closest(`.${REPLAY_BLOCK_CLASS}`)) exposed.push(text);
  }
  expect(seen.length).toBeGreaterThan(0);
  return exposed;
}

function openEveryDimension() {
  for (const row of screen.queryAllByTestId(/^coach-dim-\d+$/)) fireEvent.click(row);
}

beforeEach(() => {
  primeRubricCache(null);
  vi.spyOn(coachService, 'fetchCoachReportDetail').mockResolvedValue(REPORT);
  vi.spyOn(coachService, 'fetchReportReview').mockResolvedValue(null);
  vi.spyOn(coachService, 'fetchReportRevisions').mockResolvedValue([]);
});

afterEach(() => vi.restoreAllMocks());

describe('report text stays out of session replay', () => {
  it('in the full report a leader reads', () => {
    wrap(<ReportDetail report={REPORT} leaderName="Avery Hollis" />);
    openEveryDimension();
    expect(exposedReportText()).toEqual([]);
  });

  it('in the full report an admin reads', async () => {
    wrap(<ReportDetail report={REPORT} leaderName="Avery Hollis" admin coachId="avery" />);
    await screen.findByTestId('coach-review-readonly');
    openEveryDimension();
    expect(exposedReportText()).toEqual([]);
  });

  it('in an expanded report card', () => {
    wrap(<ReportCard report={REPORT} leaderName="Avery Hollis" admin coachId="avery" />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    openEveryDimension();
    expect(exposedReportText()).toEqual([]);
  });

  it.each(['report', 'scorecard', 'questions', 'nextsteps'])('in the %s tab of the session detail', (tab) => {
    wrap(<CoachSessionDetail report={REPORT} delta={null} coachId="avery" />);
    fireEvent.click(screen.getByTestId(`coach-tab-${tab}`));
    openEveryDimension();
    expect(exposedReportText()).toEqual([]);
  });
});

describe('toasts stay out of session replay', () => {
  it('a toast naming a leader renders inside a replay block', async () => {
    render(<Toaster />);
    act(() => {
      toast.success(`Note sent to ${MARK} Avery Hollis`);
    });
    const shown = await screen.findByText(`Note sent to ${MARK} Avery Hollis`);
    expect(shown.closest(`.${REPLAY_BLOCK_CLASS}`)).not.toBeNull();
  });
});
