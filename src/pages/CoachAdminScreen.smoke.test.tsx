/**
 * Smoke test for the Coach Oversight page — renders the four views (roster,
 * leader detail, program trends, class links) against mocked admin data and
 * exercises the nav + drill-in, guarding against runtime crashes and confirming
 * the design's key sections land on the page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import CoachAdminScreen from './CoachAdminScreen';
import * as coachService from '@/services/coachService';
import type { CoachSummary, CoachMonthly, CoachReport, CoachTrends, LeaderMonthlyResponse, AdminCoachClass } from '@/services/coachService';

vi.mock('@/services/coachService', async (io) => {
  const actual = await io<typeof import('@/services/coachService')>();
  return {
    ...actual,
    fetchAdminCoaches: vi.fn(),
    fetchAdminMonthly: vi.fn(),
    fetchCoachReportsFor: vi.fn(),
    fetchCoachTrendsFor: vi.fn(),
    fetchLeaderMonthlySummary: vi.fn(),
    fetchAllCoachClasses: vi.fn(),
  };
});
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ state: { isSignedIn: true, userFirstName: 'Daniel', userLastName: 'Reyes', userEmail: 'd@x.com', userAvatarUrl: '' } }),
}));

const DIM = ['Structure & Flow', 'Newcomer Welcome', 'Scripture', 'Facilitation', 'Application', 'Participation', 'Visual Aids', 'Vulnerability', 'Memory', 'Homework', 'Prayer', 'Leader Dev'];
const roster: CoachSummary[] = [
  { id: 'bryan', name: 'Bryan Bailey', group: 'Saturday Morning Study', coachName: '', sessionCount: 12, latest: { date: '2026-07-18', dateLabel: 'Jul 18, 2026', score: 92, status: 'Exceptional', statusEmoji: '🔷' } },
  { id: 'joel', name: 'Joel Hurt', group: "Thursday Men's Study", coachName: '', sessionCount: 7, latest: { date: '2026-07-16', dateLabel: 'Jul 16, 2026', score: 84, status: 'Strong', statusEmoji: '🟢' } },
];
const monthly: CoachMonthly = {
  month: '2026-07', monthLabel: 'July 2026',
  program: { sessions: 37, activeLeaders: 15, newcomers: 12, avgScore: 73.7, clusters: [], delta: 4.2 },
  availableMonths: ['2026-07', '2026-06'],
  leaders: [
    { id: 'bryan', name: 'Bryan Bailey', group: '', sessions: 6, avgScore: 82.4, status: 'Strong', statusEmoji: '', delta: 2, dimensions: DIM.map((n, i) => ({ n: i + 1, name: n, avg: [4.2, 4.4, 5, 3.7, 4.5, 4, 3, 4.2, 3.5, 4, 4.1, 3.3][i] })) },
    { id: 'joel', name: 'Joel Hurt', group: '', sessions: 5, avgScore: 82.6, status: 'Strong', statusEmoji: '', delta: 2, dimensions: DIM.map((n, i) => ({ n: i + 1, name: n, avg: 4 })) },
  ],
  narrative: { executiveSummary: ['Program composite reached 73.7 / 100 — Strong.', 'Visual Aids is the single largest training leverage.'], trends: ['Scripture Engagement is the strongest dimension.'] },
};
const report: CoachReport = {
  id: 's6', date: '2026-07-18', dateLabel: 'Jul 18, 2026', session: 'Lesson 9', topic: 'Wealth & Patience', duration: '~2 hr', attendees: 22, newcomers: 2, score: 92, base: 88, newcomerBonus: 2, sizeBonus: 2, status: 'Exceptional', statusEmoji: '🔷',
  clusters: [{ name: 'Teaching Craft', weight: 33, scorePct: 88, contribution: 29 }],
  dimensions: DIM.map((n, i) => ({ n: i + 1, name: n, score: [4, 4, 5, 4, 4, 4, 2, 4, 3, 4, 4, 3][i], note: `Note ${n}.` })),
  bigIdeas: ['Faith without works is dead.'],
  feedback: { headline: 'Scripture carried the hour.', strengths: [], improvements: [], recommendations: [], overview: [], strengthsProse: [], improvementsProse: [], recommendationsProse: [] },
  sections: [], docUrl: '', pdfUrl: '', notes: [{ id: 'n1', body: 'Great job on the pairings.', createdAt: '2026-07-19', emailed: true }],
};
const reportsFor = { profile: { id: 'bryan', name: 'Bryan Bailey', group: 'Saturday Morning Study', coachName: '' }, reports: [report] };
const trendsFor: CoachTrends = {
  scoreSeries: [{ date: '2026-07-11', dateLabel: 'Jul 11', session: 'L8', score: 87, status: 'Exceptional' }, { date: '2026-07-18', dateLabel: 'Jul 18', session: 'L9', score: 92, status: 'Exceptional' }],
  clusterSeries: [], dimensionSeries: [{ date: '2026-07-18', dateLabel: 'Jul 18', ...Object.fromEntries(DIM.map((n, i) => [n, [4, 4, 5, 4, 4, 4, 2, 4, 3, 4, 4, 3][i]])) }] as never, delta: null,
};
const leaderMonthly: LeaderMonthlyResponse = {
  profile: { id: 'bryan', name: 'Bryan Bailey', group: 'Saturday Morning Study' }, availableMonths: ['2026-07'],
  summary: { month: '2026-07', monthLabel: 'July 2026', priorMonthLabel: 'June 2026', leaderId: 'bryan', leaderName: 'Bryan Bailey', group: '', sessionsCount: 4, composite: 88, status: { label: 'Exceptional', emoji: '🔷' }, priorComposite: 82, delta: 6, clusterAvg: { tc: 88, bm: 76, ep: 77, br: 84 }, glance: { rows: [], avg: { bm: 76, tc: 88, ep: 77, br: 84, composite: 88, status: 'Exceptional' } }, trajectory: [], clusters: [], strengths: [{ text: 'Cross-references built a framework.', session: '07-18' }], growth: [{ text: 'Visual Aids at 2/5.', session: '07-18' }], trends: [], conversationGuide: [], focus: { clusterName: 'Building Ministry', clusterPct: 76, goals: [] }, sessions: [] },
};
const classes: AdminCoachClass[] = [
  { id: 'c1', name: 'Saturday Morning Study', classDate: null, recurrence: 'weekly', zoomLink: 'https://zoom.us/j/1', leader: { id: 'bryan', name: 'Bryan Bailey', email: 'b@x.com' } },
];

beforeEach(() => {
  vi.mocked(coachService.fetchAdminCoaches).mockResolvedValue(roster);
  vi.mocked(coachService.fetchAdminMonthly).mockResolvedValue(monthly);
  vi.mocked(coachService.fetchCoachReportsFor).mockResolvedValue(reportsFor);
  vi.mocked(coachService.fetchCoachTrendsFor).mockResolvedValue(trendsFor);
  vi.mocked(coachService.fetchLeaderMonthlySummary).mockResolvedValue(leaderMonthly);
  vi.mocked(coachService.fetchAllCoachClasses).mockResolvedValue(classes);
});

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/coach']}>
        <CoachAdminScreen />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Coach Oversight', () => {
  it('renders the roster with program health and every leader', async () => {
    renderScreen();
    expect(await screen.findByText('Bible Leader Coach')).toBeInTheDocument();
    expect(await screen.findByTestId('oversight-roster-bryan')).toBeInTheDocument();
    expect(screen.getByText('Joel Hurt')).toBeInTheDocument();
  });

  it('opens a leader detail with development + classes', async () => {
    renderScreen();
    fireEvent.click(await screen.findByTestId('oversight-roster-bryan'));
    expect(await screen.findByText('Development · the coaching conversation')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();
    // Comment composer for the session is present.
    expect(await screen.findByTestId('oversight-comment-s6')).toBeInTheDocument();
  });

  it('switches to program trends and class links', async () => {
    renderScreen();
    fireEvent.click(await screen.findByTestId('oversight-nav-trends'));
    expect(await screen.findByText('Leader leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Dimension heat map')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('oversight-nav-links'));
    expect(await screen.findByText(/The meeting links your notetaker joins/)).toBeInTheDocument();
  });
});
