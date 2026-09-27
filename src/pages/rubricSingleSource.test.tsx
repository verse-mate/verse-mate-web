import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CoachLeaderMonthlyScreen from './CoachLeaderMonthlyScreen';
import CoachTrendsScreen from './CoachTrendsScreen';
import CoachMonthlyScreen from './CoachMonthlyScreen';
import ReportBody from '@/components/coach/ReportBody';
import { BandedTrend, RadarChart } from '@/components/coach/oversightCharts';
import * as coachService from '@/services/coachService';
import { primeRubricCache } from '@/hooks/useRubric';
import type { CoachMonthly, CoachReport, LeaderMonthlyResponse, LeaderMonthlySummary } from '@/services/coachService';

vi.mock('@/services/coachService', async (io) => {
  const actual = await io<typeof import('@/services/coachService')>();
  return {
    ...actual,
    fetchCoachMe: vi.fn(),
    fetchMyMonthlySummary: vi.fn(),
    fetchAdminMonthly: vi.fn(),
  };
});
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ state: { isSignedIn: true, userFirstName: 'A', userLastName: 'B', userEmail: 'a@x.com', userAvatarUrl: '' } }),
}));

const CLUSTERS = ['Talking Clearly', 'Bringing More', 'Every Person'];
const SERVED = {
  model: 'served-model',
  clusters: CLUSTERS.map((name) => ({ name, weight: 33 })),
  dimensions: Array.from({ length: 10 }, (_, i) => ({
    n: i + 1,
    name: `Served D${i + 1}`,
    cluster: CLUSTERS[i % 3],
    clusterWeight: 33,
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

const MONTH = '2026-07';
const cluster = (key: string, name: string, avgPct: number) => ({
  key, name, weight: 33, avgPct, statusLabel: '', strongestDim: null, weakestDim: null, insight: '',
});
const summary: LeaderMonthlySummary = {
  month: MONTH,
  monthLabel: 'July 2026',
  priorMonthLabel: 'June 2026',
  leaderId: 'me',
  leaderName: 'Me',
  group: '',
  sessionsCount: 1,
  composite: 70,
  status: { label: 'Meets', emoji: '' },
  priorComposite: null,
  delta: null,
  clusterAvg: { tc: 50, bm: 10, ep: 95, br: 70 },
  glance: {
    rows: [{ date: '2026-07-18', session: 'L1', bm: 10, tc: 50, ep: 95, br: 70, composite: 70, status: 'Meets' }],
    avg: { bm: 10, tc: 50, ep: 95, br: 70, composite: 70, status: 'Meets' },
  },
  trajectory: [],
  clusters: [cluster('tc', 'Talking Clearly', 76), cluster('bm', 'Bringing More', 89)],
  strengths: [],
  growth: [],
  trends: [],
  conversationGuide: [],
  focus: { clusterName: '', clusterPct: null, goals: [] },
  sessions: [],
};
const response: LeaderMonthlyResponse = { profile: { id: 'me', name: 'Me', group: '' }, summary, availableMonths: [MONTH] };

beforeEach(() => {
  primeRubricCache(SERVED);
  vi.mocked(coachService.fetchMyMonthlySummary).mockResolvedValue(response);
  vi.mocked(coachService.fetchCoachMe).mockResolvedValue({
    isCoach: true, isAdmin: false, profile: { id: 'me', name: 'Me', email: '', group: '', coachName: '' },
    zoomLink: '', affiliatedChurch: '', bibleCoach: '', model: 'served-model', clusters: [], statusBands: [],
  } as never);
});

function renderAt(path: string, route: string, element: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={route} element={element} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("the leader's monthly summary takes its clusters and bands from the served rubric", () => {
  it('draws one chip per served cluster, named by the served name', async () => {
    renderAt('/coach/monthly-summary', '/coach/monthly-summary', <CoachLeaderMonthlyScreen />);
    expect(await screen.findByTestId('coach-monthly-cluster-tc')).toHaveTextContent('Talking Clearly');
    expect(screen.getByTestId('coach-monthly-cluster-bm')).toHaveTextContent('Bringing More');
    expect(screen.queryByTestId('coach-monthly-cluster-br')).toBeNull();
    expect(screen.queryByText('TEACHING')).toBeNull();
  });

  it('heads the glance columns with the served clusters only', async () => {
    renderAt('/coach/monthly-summary', '/coach/monthly-summary', <CoachLeaderMonthlyScreen />);
    await screen.findByTestId('coach-monthly-cluster-tc');
    expect(screen.getByText('TC%')).toBeInTheDocument();
    expect(screen.queryByText('BR%')).toBeNull();
  });

  it('colours a percentage by the served band it falls in, all five of them', async () => {
    renderAt('/coach/monthly-summary', '/coach/monthly-summary', <CoachLeaderMonthlyScreen />);
    const growing = await screen.findByTestId('coach-monthly-cluster-pct-tc');
    const starting = screen.getByTestId('coach-monthly-cluster-pct-bm');
    expect(growing.style.color).not.toBe(starting.style.color);
    const solidLow = screen.getByTestId('coach-monthly-deepdive-tc');
    const solidHigh = screen.getByTestId('coach-monthly-deepdive-bm');
    expect(solidLow.style.color).toBe(solidHigh.style.color);
  });
});

describe('the trends page states the served rubric, not a remembered one', () => {
  it('counts dimensions and clusters from the served definition', async () => {
    renderAt('/coach/trends', '/coach/trends', <CoachTrendsScreen />);
    expect(await screen.findByText(/served-model, 10 dimensions × 3 clusters/)).toBeInTheDocument();
    expect(screen.getByText('All 10 dimensions')).toBeInTheDocument();
    expect(screen.getByText(/scored across all 10 dimensions/)).toBeInTheDocument();
  });

  it('heads the glance columns with the served clusters only', async () => {
    renderAt('/coach/trends', '/coach/trends', <CoachTrendsScreen />);
    await screen.findByText('Month at a glance');
    expect(screen.getByText('TC')).toBeInTheDocument();
    expect(screen.getByText('EP')).toBeInTheDocument();
    expect(screen.queryByText('BR')).toBeNull();
  });
});

describe('the program monthly heatmap reads the served dimension bands', () => {
  const monthly: CoachMonthly = {
    month: MONTH,
    monthLabel: 'July 2026',
    program: { sessions: 1, activeLeaders: 1, newcomers: 0, avgScore: 50, clusters: [], delta: null },
    availableMonths: [MONTH],
    leaders: [
      {
        id: 'x', name: 'X', group: '', sessions: 1, avgScore: 50, status: 'Growing', statusEmoji: '', delta: null,
        dimensions: [
          { n: 1, name: 'Served D1', avg: 2 },
          { n: 2, name: 'Served D2', avg: 1 },
        ],
      },
    ],
    narrative: null,
  };

  it('gives a Developing cell and an Early stage cell different colours, and names every band', async () => {
    vi.mocked(coachService.fetchAdminMonthly).mockResolvedValue(monthly);
    renderAt('/coach/monthly', '/coach/monthly', <CoachMonthlyScreen />);
    const developing = await screen.findByTitle('Served D1: 2.0');
    const early = screen.getByTitle('Served D2: 1.0');
    expect(developing.style.background).not.toBe(early.style.background);
    const legend = screen.getByTestId('coach-monthly-heat-legend');
    for (const band of SERVED.dimensionBands) expect(legend).toHaveTextContent(band.label);
    expect(screen.queryByText(/12-dimension/)).toBeNull();
  });
});

describe('a report body counts the dimensions it carries', () => {
  it('titles the list with the number of dimensions scored', () => {
    const report = {
      id: 'r', date: '', dateLabel: '', session: '', topic: '', duration: '', attendees: 0, newcomers: 0,
      score: 0, base: 0, newcomerBonus: 0, sizeBonus: 0, status: '', statusEmoji: '', clusters: [], bigIdeas: [],
      dimensions: SERVED.dimensions.map((d) => ({ n: d.n, name: d.name, score: 3 })),
      feedback: { headline: '', strengths: [], improvements: [], recommendations: [] },
    } as CoachReport;
    render(<ReportBody report={report} />);
    expect(screen.getByText(/The 10 Dimensions/)).toBeInTheDocument();
  });
});

describe('the oversight charts take their shape from what they are fed', () => {
  it('draws one spoke and one label per served dimension', () => {
    const { container } = render(<RadarChart vals={Array(10).fill(3)} />);
    const svg = container.querySelector('svg') as SVGSVGElement;
    expect(within(svg as unknown as HTMLElement).getByText('D10')).toBeTruthy();
    expect(within(svg as unknown as HTMLElement).queryByText('D11')).toBeNull();
    expect(svg.querySelectorAll('line')).toHaveLength(10);
    expect(svg.getAttribute('aria-label')).toBe('10-dimension radar');
  });

  it('keeps a score in a low served band on the chart', () => {
    const bands = [{ min: 80 }, { min: 50 }, { min: 20 }, { min: 0 }];
    const { container } = render(<BandedTrend values={[25, 30]} labels={['a', 'b']} bands={bands} />);
    const circles = [...container.querySelectorAll('circle')];
    const floorY = 200 - 34;
    for (const c of circles) expect(Number(c.getAttribute('cy'))).toBeLessThanOrEqual(floorY);
    expect(container.querySelectorAll('rect')).toHaveLength(bands.length);
    for (const r of container.querySelectorAll('rect')) expect(Number(r.getAttribute('height'))).toBeGreaterThan(0);
  });
});
