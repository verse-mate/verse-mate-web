import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import CoachAdminScreen from './CoachAdminScreen';
import * as coachService from '@/services/coachService';
import { primeRubricCache } from '@/hooks/useRubric';
import type { CoachMonthly, CoachReport, CoachSummary, CoachTrends } from '@/services/coachService';

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
    fetchPendingReshares: vi.fn(),
  };
});
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ state: { isSignedIn: true, userFirstName: 'A', userLastName: 'B', userEmail: 'a@x.com', userAvatarUrl: '' } }),
}));

const SERVED = {
  model: 'served-model',
  clusters: [
    { name: 'Alpha Group', weight: 50 },
    { name: 'Beta Group', weight: 50 },
  ],
  dimensions: Array.from({ length: 12 }, (_, i) => ({
    n: i + 1,
    name: `Served D${i + 1}`,
    cluster: i < 6 ? 'Alpha Group' : 'Beta Group',
    clusterWeight: 50,
    what: '',
    target: '',
  })),
  statusBands: [
    { min: 90, label: 'Top Tier', emoji: '🔷' },
    { min: 75, label: 'Solid', emoji: '🟢' },
    { min: 60, label: 'Meets', emoji: '🟡' },
    { min: 40, label: 'Growing', emoji: '🟠' },
    { min: 0, label: 'Starting', emoji: '🔴' },
  ],
  dimensionBands: [
    { min: 5, label: 'Exemplary' },
    { min: 4, label: 'Strong' },
    { min: 3, label: 'On target' },
    { min: 2, label: 'Developing' },
    { min: 1, label: 'Early stage' },
  ],
};

const DIMS = SERVED.dimensions.map((d) => d.name);
const latest = (score: number, status: string) => ({ date: '2026-07-18', dateLabel: 'Jul 18', score, status, statusEmoji: '' });
const roster: CoachSummary[] = [
  { id: 'ann', name: 'Ann Top', group: 'G', coachName: '', sessionCount: 3, latest: latest(95, 'Top Tier') },
  { id: 'ben', name: 'Ben Solid', group: 'G', coachName: '', sessionCount: 3, latest: latest(80, 'Solid') },
  { id: 'cal', name: 'Cal Start', group: 'G', coachName: '', sessionCount: 3, latest: latest(30, 'Starting') },
];
const monthly: CoachMonthly = {
  month: '2026-07',
  monthLabel: 'July 2026',
  program: { sessions: 9, activeLeaders: 3, newcomers: 0, avgScore: 30, clusters: [], delta: null },
  availableMonths: ['2026-07'],
  leaders: [
    { id: 'cal', name: 'Cal Start', group: '', sessions: 3, avgScore: 30, status: 'Starting', statusEmoji: '', delta: null, dimensions: DIMS.map((name, i) => ({ n: i + 1, name, avg: i < 6 ? 5 : 1 })) },
  ],
  narrative: null,
};
const report: CoachReport = {
  id: 's1', date: '2026-07-18', dateLabel: 'Jul 18', session: 'L1', topic: '', duration: '', attendees: 1, newcomers: 0,
  score: 30, base: 30, newcomerBonus: 0, sizeBonus: 0, status: 'Starting', statusEmoji: '',
  clusters: [], dimensions: DIMS.map((name, i) => ({ n: i + 1, name, score: i < 6 ? 5 : 1 })), bigIdeas: [],
  feedback: { headline: '', strengths: [], improvements: [], recommendations: [] },
};
const trends: CoachTrends = {
  scoreSeries: [],
  clusterSeries: [],
  dimensionSeries: [{ date: '2026-07-18', dateLabel: 'Jul 18', ...Object.fromEntries(DIMS.map((n, i) => [n, i < 6 ? 5 : 1])) }] as never,
  delta: null,
};

beforeEach(() => {
  primeRubricCache(SERVED);
  vi.mocked(coachService.fetchAdminCoaches).mockResolvedValue(roster);
  vi.mocked(coachService.fetchAdminMonthly).mockResolvedValue(monthly);
  vi.mocked(coachService.fetchCoachReportsFor).mockResolvedValue({ profile: { id: 'cal', name: 'Cal Start', group: 'G', coachName: '' }, reports: [report] });
  vi.mocked(coachService.fetchCoachTrendsFor).mockResolvedValue(trends);
  vi.mocked(coachService.fetchLeaderMonthlySummary).mockResolvedValue({ profile: { id: 'cal', name: 'Cal Start', group: 'G' }, availableMonths: [], summary: null });
  vi.mocked(coachService.fetchAllCoachClasses).mockResolvedValue([]);
  vi.mocked(coachService.fetchPendingReshares).mockResolvedValue([]);
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

describe('the admin screen renders the served rubric, never a copy of it', () => {
  it('names a composite of 30 by the served band it falls in', async () => {
    renderScreen();
    expect(await screen.findByText(/a Starting program month/)).toBeInTheDocument();
  });

  it('buckets the status mix by every served band', async () => {
    renderScreen();
    const mix = await screen.findByTestId('oversight-status-mix');
    for (const band of SERVED.statusBands) {
      expect(within(mix).getByTestId(`oversight-status-mix-${band.label}`)).toBeInTheDocument();
    }
    expect(within(mix).getByTestId('oversight-status-mix-Starting')).toHaveTextContent('1');
    expect(within(mix).getByTestId('oversight-status-mix-Top Tier')).toHaveTextContent('1');
  });

  it('shows the served dimension name, not a positional short name', async () => {
    renderScreen();
    fireEvent.click(await screen.findByTestId('oversight-roster-cal'));
    expect((await screen.findAllByText('Served D1')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Structure & Flow')).toBeNull();
  });

  it('rolls dimensions into clusters by the served mapping', async () => {
    renderScreen();
    fireEvent.click(await screen.findByTestId('oversight-roster-cal'));
    await screen.findByText(/Sessions so far/);
    expect(screen.getByTestId('oversight-cluster-mix-Alpha Group')).toHaveTextContent('100%');
    expect(screen.getByTestId('oversight-cluster-mix-Beta Group')).toHaveTextContent('20%');
  });

  it('labels the score bands legend from the served bands', async () => {
    renderScreen();
    fireEvent.click(await screen.findByTestId('oversight-roster-cal'));
    expect(await screen.findByText(/🔷90\+/)).toBeInTheDocument();
  });

  it('builds leaderboard cluster columns from the served clusters', async () => {
    renderScreen();
    fireEvent.click(await screen.findByTestId('oversight-nav-trends'));
    await screen.findByText('Leader leaderboard');
    expect(screen.getByRole('button', { name: 'AG' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'BM' })).toBeNull();
    const row = screen.getByTestId('oversight-leaderboard-cal');
    expect(row).toHaveTextContent('100');
    expect(row).toHaveTextContent('20');
  });

  it('lists every served band in the score distribution, including the lowest', async () => {
    renderScreen();
    fireEvent.click(await screen.findByTestId('oversight-nav-trends'));
    expect(await screen.findByTestId('oversight-distribution-Starting')).toHaveTextContent('Cal Start');
  });
});
