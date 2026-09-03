import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as rubricService from '@/services/rubric';
import type { RubricContract } from '@/services/rubric';
import { primeRubricCache, useRubric } from './useRubric';

/**
 * The HOOK, as a component actually consumes it (change: port-coach-pipeline,
 * tasks 8.1-8.3).
 *
 * `useRubric.test.ts` covers `loadRubric` and the cluster helpers directly.
 * What only a render can show is the part every coach screen depends on: that
 * a failed fetch leaves the screen standing, and that six components mounting
 * at once still make one request.
 */
const CONTRACT: RubricContract = {
  model: 'test-model',
  clusters: [
    { name: 'Teaching Craft', weight: 0.4 },
    { name: 'Body Ministry', weight: 0.3 },
  ],
  dimensions: [],
  statusBands: [{ min: 90, label: 'Exceptional', emoji: '🥇' }],
  dimensionBands: [{ min: 5, label: 'Excellent' }],
};

function Probe() {
  const { rubric, loading, error } = useRubric();
  return (
    <div>
      <span data-testid="state">
        {loading ? 'loading' : error ? `error:${error.message}` : (rubric?.model ?? 'none')}
      </span>
    </div>
  );
}

afterEach(() => {
  primeRubricCache(null);
  vi.restoreAllMocks();
});

describe('the served rubric', () => {
  it('is fetched ONCE for however many components ask', async () => {
    // Half a dozen coach components need the contract. Without the module
    // cache, opening the dashboard fetched the same definition once per chart.
    const fetchSpy = vi
      .spyOn(rubricService, 'fetchRubric')
      .mockResolvedValue(CONTRACT);

    render(
      <>
        <Probe />
        <Probe />
        <Probe />
      </>,
    );

    await waitFor(() =>
      expect(screen.getAllByTestId('state')[0]).toHaveTextContent('test-model'),
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('a FAILED fetch surfaces an error rather than blanking the screen', async () => {
    // The scores are still the leader's. A dashboard that renders nothing
    // because an explainer failed to load is worse than one without explainers.
    vi.spyOn(rubricService, 'fetchRubric').mockRejectedValue(
      new Error('rubric 503'),
    );

    render(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId('state')).toHaveTextContent('error:rubric 503'),
    );
  });

  it('a primed cache renders on the FIRST paint, with no loading flash', () => {
    const fetchSpy = vi.spyOn(rubricService, 'fetchRubric');
    primeRubricCache(CONTRACT);

    render(<Probe />);
    expect(screen.getByTestId('state')).toHaveTextContent('test-model');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('a retry after a failure is allowed to fetch again', async () => {
    // The failure is not cached: a component mounting later gets a fresh
    // attempt rather than inheriting the first one's error.
    const fetchSpy = vi
      .spyOn(rubricService, 'fetchRubric')
      .mockRejectedValueOnce(new Error('rubric 503'))
      .mockResolvedValueOnce(CONTRACT);

    const first = render(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId('state')).toHaveTextContent('error:'),
    );
    first.unmount();

    render(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId('state')).toHaveTextContent('test-model'),
    );
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
