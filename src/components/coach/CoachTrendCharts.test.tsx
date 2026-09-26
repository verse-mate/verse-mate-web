import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { primeRubricCache } from '@/hooks/useRubric';
import type { CoachTrends } from '@/services/coachService';
import { ClusterTrendCard } from './CoachTrendCharts';

const TRENDS = {
  scoreSeries: [],
  clusterSeries: [
    { date: '2026-08-22', dateLabel: 'Aug 22', 'Teaching Craft': 26, 'Being Real': 14 },
    { date: '2026-08-29', dateLabel: 'Aug 29', 'Teaching Craft': 28, 'Being Real': null },
  ],
  dimensionSeries: [],
} as unknown as CoachTrends;

describe('the cluster chart before the rubric resolves', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    primeRubricCache(null);
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('names only the clusters the series carries, never a field like dateLabel', () => {
    render(<ClusterTrendCard trends={TRENDS} />);
    const card = screen.getByTestId('coach-trend-cluster');
    expect(within(card).getByText('Teaching Craft')).toBeInTheDocument();
    expect(within(card).getByText('Being Real')).toBeInTheDocument();
    expect(within(card).queryByText('dateLabel')).toBeNull();
    expect(within(card).queryByText('date')).toBeNull();
    expect(within(card).queryByText('label')).toBeNull();
  });
});
