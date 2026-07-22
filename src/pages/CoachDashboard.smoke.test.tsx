/**
 * Smoke tests for the coaching-dashboard screens (Home / Sessions / Trends).
 * They mock the /coach service + AppContext so the screens render against
 * realistic data without a backend, guarding against runtime crashes and
 * confirming the key design elements + real-data wiring land on the page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CoachDashboardScreen from './CoachDashboardScreen';
import CoachSessionsScreen from './CoachSessionsScreen';
import CoachTrendsScreen from './CoachTrendsScreen';
import * as coachService from '@/services/coachService';
import type {
  CoachReport,
  CoachMe,
  CoachTrends,
  CoachClass,
  LeaderMonthlyResponse,
} from '@/services/coachService';

vi.mock('@/services/coachService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/coachService')>();
  return {
    ...actual,
    fetchCoachMe: vi.fn(),
    fetchCoachReports: vi.fn(),
    fetchCoachTrends: vi.fn(),
    fetchCoachClasses: vi.fn(),
    fetchMyMonthlySummary: vi.fn(),
  };
});

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    state: {
      isSignedIn: true,
      userFirstName: 'Bryan',
      userLastName: 'Bailey',
      userEmail: 'bryan@example.com',
      userAvatarUrl: '',
    },
  }),
}));

const me: CoachMe = {
  isCoach: true,
  isAdmin: false,
  profile: { id: 'bryan', name: 'Bryan Bailey', email: 'bryan@example.com', group: 'Saturday Morning', coachName: '' },
  zoomLink: '',
  affiliatedChurch: '',
  bibleCoach: '',
  model: 'v3',
  clusters: [],
  statusBands: [],
};

function makeReport(over: Partial<CoachReport> = {}): CoachReport {
  return {
    id: 'L9',
    date: '2026-07-18',
    dateLabel: 'July 18, 2026',
    session: 'James — Lesson 9: Wealth & Patience',
    topic: 'James 4:13–5:12',
    duration: '~2 hr 18 min',
    attendees: 28,
    newcomers: 6,
    score: 87,
    base: 83.7,
    newcomerBonus: 5,
    sizeBonus: 3,
    status: 'Exceptional',
    statusEmoji: '🔷',
    clusters: [
      { name: 'Teaching Craft', weight: 33, scorePct: 92, contribution: 30 },
      { name: 'Being Real', weight: 18, scorePct: 90, contribution: 16 },
    ],
    dimensions: Array.from({ length: 12 }, (_, i) => ({
      n: i + 1,
      name: `Dimension ${i + 1}`,
      score: (i % 5) + 1,
      note: `Coach note for dimension ${i + 1}.`,
    })),
    bigIdeas: ['Faith without works is dead', 'Your riches have already rotted'],
    feedback: {
      headline: 'A newcomer-heavy Saturday with excellent teaching craft.',
      strengths: ['The newcomer multiplication system — nine named pairings'],
      improvements: ['Three monologue stretches exceeded the target'],
      recommendations: ['Break any explanation past 90 seconds with a question'],
      overview: [],
      strengthsProse: [{ title: 'Newcomer multiplication', paragraphs: ['Nine pairings in under two minutes.'] }],
      improvementsProse: [{ title: 'Monologues', paragraphs: ['Three stretches ran long.'] }],
      recommendationsProse: [{ title: 'Break long explanations', paragraphs: ['Pause at 60–90s and ask a question.'] }],
    },
    sections: [
      {
        title: 'Key moments',
        moments: [{ timestamp: '02:07:16', detail: "Mike's heart-attack confession\n\nWhat happened: A disclosure.\n\nMake it bigger: Land it with one forward step." }],
      },
      {
        title: 'Application questions',
        bullets: ['Mike, what are you thinking about your wealth? — Level 4 — apply to life — The session signature moment.'],
      },
    ],
    docUrl: '',
    pdfUrl: 'https://drive.google.com/file/d/abc/view',
    ...over,
  };
}

const reports: CoachReport[] = [
  makeReport(),
  makeReport({ id: 'L8', date: '2026-07-11', dateLabel: 'July 11, 2026', session: 'James — Lesson 8', score: 82, status: 'Strong' }),
];

const trends: CoachTrends = {
  scoreSeries: [
    { date: '2026-07-11', dateLabel: 'Jul 11', session: 'L8', score: 82, status: 'Strong' },
    { date: '2026-07-18', dateLabel: 'Jul 18', session: 'L9', score: 87, status: 'Exceptional' },
  ],
  clusterSeries: [],
  dimensionSeries: [
    { date: '2026-07-11', dateLabel: 'Jul 11', 'Dimension 1': 4 },
    { date: '2026-07-18', dateLabel: 'Jul 18', 'Dimension 1': 5 },
  ],
  delta: { score: 5, from: 82, to: 87, fromLabel: 'Jul 11', toLabel: 'Jul 18' },
};

const classes: CoachClass[] = [
  { id: 'sat', name: 'James — Saturday Morning Group', classDate: null, recurrence: 'weekly', zoomLink: 'https://zoom.us/j/1' },
];

const monthly: LeaderMonthlyResponse = {
  profile: { id: 'bryan', name: 'Bryan Bailey', group: 'Saturday Morning' },
  availableMonths: ['2026-06'],
  summary: {
    month: '2026-06',
    monthLabel: 'June 2026',
    priorMonthLabel: 'May 2026',
    leaderId: 'bryan',
    leaderName: 'Bryan Bailey',
    group: 'Saturday Morning',
    sessionsCount: 6,
    composite: 82.4,
    status: { label: 'Strong', emoji: '🟢' },
    priorComposite: 74.9,
    delta: 7.5,
    clusterAvg: { tc: 80, bm: 76, ep: 77, br: 83 },
    glance: {
      rows: [{ date: '2026-06-27', session: 'James L7', bm: 87, tc: 88, ep: 80, br: 90, composite: 92.5, status: 'Exceptional' }],
      avg: { bm: 76, tc: 80, ep: 77, br: 83, composite: 82.4, status: 'Strong' },
    },
    trajectory: [
      { date: '2026-06-13', session: 'James L5', composite: 86.3, status: 'Exceptional', delta: null },
      { date: '2026-06-27', session: 'James L7', composite: 92.5, status: 'Exceptional', delta: 6.2 },
    ],
    clusters: [
      { key: 'TC', name: 'Teaching Craft', weight: 33, avgPct: 80, statusLabel: 'Strong', strongestDim: { name: 'Scripture', val: 5 }, weakestDim: { name: 'Visual Aids', val: 3 }, insight: 'Visual Aids is the bottleneck.' },
    ],
    strengths: [{ text: '22+ cross-references', session: '06-04' }],
    growth: [{ text: 'Visual Aids at 2/5', session: '06-04' }],
    trends: ['Six sessions, a strong within-month arc.'],
    conversationGuide: [],
    focus: { clusterName: 'Building Ministry', clusterPct: 76, goals: ['Name an apprentice for July'] },
    sessions: [
      {
        date: '2026-06-27',
        session: 'James L7',
        composite: 92.5,
        status: 'Exceptional',
        dimensions: [{ n: 1, name: 'Session Structure', cluster: 'Teaching Craft', score: 4, note: 'Blueprint executed.' }],
      },
    ],
  },
};

function renderAt(path: string, element: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/coach" element={element} />
          <Route path="/coach/sessions" element={element} />
          <Route path="/coach/trends" element={element} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(coachService.fetchCoachMe).mockResolvedValue(me);
  vi.mocked(coachService.fetchCoachReports).mockResolvedValue(reports);
  vi.mocked(coachService.fetchCoachTrends).mockResolvedValue(trends);
  vi.mocked(coachService.fetchCoachClasses).mockResolvedValue(classes);
  vi.mocked(coachService.fetchMyMonthlySummary).mockResolvedValue(monthly);
});

describe('Coaching dashboard — Home', () => {
  it('renders the greeting, latest score, next class and session detail', async () => {
    renderAt('/coach', <CoachDashboardScreen />);
    // Latest /100 composite (real data, not the mock /55 grade).
    expect(await screen.findByText('/100 · Exceptional')).toBeInTheDocument();
    // Next class band pulls the recurring class.
    expect(screen.getByText('James — Saturday Morning Group')).toBeInTheDocument();
    // Session detail header + tabs.
    expect(screen.getByTestId('coach-tab-scorecard')).toBeInTheDocument();
  });

  it('switches to the Scorecard tab and expands a dimension', async () => {
    renderAt('/coach', <CoachDashboardScreen />);
    fireEvent.click(await screen.findByTestId('coach-tab-scorecard'));
    fireEvent.click(await screen.findByTestId('coach-dim-1'));
    expect(screen.getByText('COACH FEEDBACK')).toBeInTheDocument();
  });
});

describe('Coaching dashboard — Sessions', () => {
  it('lists recurring classes and past sessions with the view action', async () => {
    renderAt('/coach/sessions', <CoachSessionsScreen />);
    expect(await screen.findByText('James — Saturday Morning Group')).toBeInTheDocument();
    expect(screen.getAllByTestId('coach-view-report').length).toBeGreaterThan(0);
    // Add form toggles.
    fireEvent.click(screen.getByTestId('coach-sessions-add'));
    expect(screen.getByTestId('coach-class-form')).toBeInTheDocument();
  });
});

describe('Coaching dashboard — Trends', () => {
  it('renders the monthly summary band and per-session detail', async () => {
    renderAt('/coach/trends', <CoachTrendsScreen />);
    expect(await screen.findByText('MONTHLY COACHING SUMMARY')).toBeInTheDocument();
    // "June 2026" appears in both the month pill and the summary band.
    expect(screen.getAllByText('June 2026').length).toBeGreaterThan(0);
    // Per-session appendix expands.
    fireEvent.click(await screen.findByTestId('coach-appendix-0'));
    expect(screen.getByText('Session Structure')).toBeInTheDocument();
  });
});
