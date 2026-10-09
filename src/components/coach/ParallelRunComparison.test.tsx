import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { primeRubricCache } from '@/hooks/useRubric';
import * as coachService from '@/services/coachService';
import { CoachApiError, type ParallelRunComparison as Comparison } from '@/services/coachService';
import type { RubricContract } from '@/services/rubric';
import ParallelRunComparison from './ParallelRunComparison';

const RUBRIC: RubricContract = {
  model: 'v3',
  clusters: [{ name: 'Teaching Craft', weight: 100 }],
  dimensions: Array.from({ length: 3 }, (_, i) => ({
    n: i + 1,
    name: `Served dimension ${i + 1}`,
    cluster: 'Teaching Craft',
    clusterWeight: 100,
    what: '',
    target: '',
  })),
  statusBands: [{ min: 0, label: 'Strong', emoji: '' }],
  dimensionBands: [],
};

const ROSTER = [
  { id: 'leader-a', name: 'Leader A', group: '', coachName: '', sessionCount: 2, latest: null },
  { id: 'leader-b', name: 'Leader B', group: '', coachName: '', sessionCount: 1, latest: null },
];

const CLOSE = {
  coachId: 'leader-a',
  date: '2026-09-12',
  backend: { sourceSessionId: 'ff-close', reportId: 'be-close', composite: 74.5 },
  host: { reportId: 'host-close', composite: 78 },
  compositeDifference: 3.5,
  dimensions: [
    { n: 1, host: 4, backend: 4, difference: 0 },
    { n: 2, host: 3, backend: 4, difference: 1 },
    { n: 3, host: 5, backend: null, difference: null },
  ],
  withinOne: 2,
  comparable: 2,
  flagged: false,
};

const FAR = {
  coachId: 'leader-b',
  date: '2026-09-05',
  backend: { sourceSessionId: 'ff-far', reportId: 'be-far', composite: 61 },
  host: { reportId: 'host-far', composite: 70 },
  compositeDifference: 9,
  dimensions: [
    { n: 1, host: 4, backend: 2, difference: 2 },
    { n: 2, host: 3, backend: 3, difference: 0 },
    { n: 3, host: 4, backend: 4, difference: 0 },
  ],
  withinOne: 2,
  comparable: 3,
  flagged: true,
};

const FULL: Comparison = {
  sessions: [CLOSE, FAR],
  needsPairing: [
    {
      coachId: 'leader-a',
      date: '2026-09-19',
      backend: [
        { sourceSessionId: 'ff-am', reportId: 'be-am' },
        { sourceSessionId: 'ff-pm', reportId: 'be-pm' },
      ],
      host: [{ reportId: 'host-19' }],
    },
  ],
  unmatched: {
    backend: [{ coachId: 'leader-b', date: '2026-09-26', sourceSessionId: 'ff-only', reportId: 'be-only' }],
    host: [{ coachId: 'leader-a', date: '2026-08-29', reportId: 'host-only' }],
  },
  share: { withinOne: 4, comparable: 5, ratio: 0.8 },
  counts: { compared: 2, flagged: 1, needsPairing: 1, unmatchedBackend: 1, unmatchedHost: 1 },
};

const EMPTY: Comparison = {
  sessions: [],
  needsPairing: [],
  unmatched: { backend: [], host: [] },
  share: { withinOne: 0, comparable: 0, ratio: null },
  counts: { compared: 0, flagged: 0, needsPairing: 0, unmatchedBackend: 0, unmatchedHost: 0 },
};

function renderView() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ParallelRunComparison />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  primeRubricCache(RUBRIC);
  vi.spyOn(coachService, 'fetchAdminCoaches').mockResolvedValue(ROSTER);
});

afterEach(() => {
  vi.restoreAllMocks();
  primeRubricCache(null);
});

describe('the parallel-run comparison', () => {
  it('states the overall share within one point and the counts', async () => {
    vi.spyOn(coachService, 'fetchParallelRunComparison').mockResolvedValue(FULL);
    renderView();

    expect(await screen.findByTestId('coach-parallel-share')).toHaveTextContent('4 of 5 dimensions within one point (80%)');
    const counts = screen.getByTestId('coach-parallel-counts');
    expect(counts).toHaveTextContent('2 compared');
    expect(counts).toHaveTextContent('1 flagged');
    expect(counts).toHaveTextContent('1 to pair');
    expect(counts).toHaveTextContent('1 scored by the backend only');
    expect(counts).toHaveTextContent('1 on the host only');
  });

  it('lists flagged sessions first, marked, with the composite and every dimension side by side', async () => {
    vi.spyOn(coachService, 'fetchParallelRunComparison').mockResolvedValue(FULL);
    renderView();

    const rows = await screen.findAllByTestId(/^coach-parallel-session-/);
    expect(rows.map((r) => r.dataset.testid)).toEqual(['coach-parallel-session-ff-far', 'coach-parallel-session-ff-close']);

    const far = rows[0];
    expect(within(far).getByTestId('coach-parallel-flagged-ff-far')).toHaveTextContent('Flagged for the cutover read');
    expect(far).toHaveTextContent('Leader B');
    expect(far).toHaveTextContent('2026-09-05');
    expect(far).toHaveTextContent('Backend 61.0 · Host 70.0 · 9.0 apart');

    const close = rows[1];
    expect(within(close).queryByTestId('coach-parallel-flagged-ff-close')).toBeNull();
    expect(close).toHaveTextContent('2 of 2 dimensions within one point');
    const naRow = within(close).getByTestId('coach-parallel-dim-ff-close-3');
    expect(naRow).toHaveTextContent('Served dimension 3');
    expect(naRow).toHaveTextContent('N/A');
    expect(naRow).toHaveTextContent('left out of the share');
    expect(within(close).getByTestId('coach-parallel-dim-ff-close-2')).toHaveTextContent('Served dimension 2');
  });

  it('can show only the flagged sessions', async () => {
    vi.spyOn(coachService, 'fetchParallelRunComparison').mockResolvedValue(FULL);
    renderView();

    fireEvent.click(await screen.findByTestId('coach-parallel-only-flagged'));
    expect(screen.getAllByTestId(/^coach-parallel-session-/).map((r) => r.dataset.testid)).toEqual(['coach-parallel-session-ff-far']);
  });

  it('lists the sessions an admin must pair, and what each side scored alone', async () => {
    vi.spyOn(coachService, 'fetchParallelRunComparison').mockResolvedValue(FULL);
    renderView();

    const pairing = await screen.findByTestId('coach-parallel-pairing-leader-a-2026-09-19');
    expect(pairing).toHaveTextContent('Leader A');
    expect(pairing).toHaveTextContent('2 backend sessions (ff-am, ff-pm)');
    expect(pairing).toHaveTextContent('1 host report (host-19)');
    expect(screen.getByTestId('coach-parallel-unmatched-backend')).toHaveTextContent('Leader B · 2026-09-26 · session ff-only');
    expect(screen.getByTestId('coach-parallel-unmatched-host')).toHaveTextContent('Leader A · 2026-08-29 · report host-only');
  });

  it('says plainly when nothing has been compared yet', async () => {
    vi.spyOn(coachService, 'fetchParallelRunComparison').mockResolvedValue(EMPTY);
    renderView();

    expect(await screen.findByTestId('coach-parallel-empty')).toHaveTextContent('Nothing has been compared yet');
    expect(screen.queryByTestId('coach-parallel-share')).toBeNull();
  });

  it('shows a failure as a failure, never as an empty comparison', async () => {
    vi.spyOn(coachService, 'fetchParallelRunComparison').mockRejectedValue(
      new CoachApiError('admin/parallel-run/comparison', 500, 'database unavailable'),
    );
    renderView();

    expect(await screen.findByTestId('coach-parallel-failed')).toHaveTextContent('Server error (500): database unavailable');
    expect(screen.queryByTestId('coach-parallel-empty')).toBeNull();
  });
});
