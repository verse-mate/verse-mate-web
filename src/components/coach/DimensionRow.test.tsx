import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { primeRubricCache } from '@/hooks/useRubric';
import type { RubricContract } from '@/services/rubric';
import DimensionRow from './DimensionRow';

const RUBRIC: RubricContract = {
  model: 'v3-weighted-100',
  clusters: [{ name: 'Teaching Craft', weight: 33 }],
  dimensions: [
    {
      n: 1,
      name: 'Session Structure & Flow',
      cluster: 'Teaching Craft',
      clusterWeight: 33,
      what: 'How well the session follows the ten-step blueprint.',
      target: 'All 10 steps, well-paced',
    },
  ],
  statusBands: [],
  dimensionBands: [
    { min: 5, label: 'Exemplary' },
    { min: 4, label: 'Strong' },
    { min: 3, label: 'On target' },
    { min: 2, label: 'Developing' },
    { min: 1, label: 'Early stage' },
  ],
};

const DIM = {
  n: 1,
  name: 'Session Structure & Flow',
  score: 4,
  note: 'Solid blueprint, one gap at the recap.',
};

describe('a dimension shows the SERVED explainer', () => {
  beforeEach(() => primeRubricCache(RUBRIC));

  it('expands to the served description, target and cluster weight', () => {
    render(<DimensionRow dim={DIM} />);
    fireEvent.click(screen.getByTestId('coach-dim-1'));
    expect(
      screen.getByText(/How well the session follows the ten-step blueprint/),
    ).toBeInTheDocument();
    expect(screen.getByText(/All 10 steps, well-paced/)).toBeInTheDocument();
    expect(screen.getByText(/Teaching Craft · weight 33/)).toBeInTheDocument();
  });

  it('reads the score into the SERVED band label', () => {
    render(<DimensionRow dim={DIM} />);
    fireEvent.click(screen.getByTestId('coach-dim-1'));
    expect(screen.getByText(/4\/5 · Strong/)).toBeInTheDocument();
  });

  it('a renamed band label reaches the UI with no portal edit', () => {
    // The single-source property, from the portal's side.
    primeRubricCache({
      ...RUBRIC,
      dimensionBands: [{ min: 1, label: 'Renamed' }],
    });
    render(<DimensionRow dim={DIM} />);
    fireEvent.click(screen.getByTestId('coach-dim-1'));
    expect(screen.getByText(/4\/5 · Renamed/)).toBeInTheDocument();
  });
});

describe('a missing rubric does not take the leader’s own content with it', () => {
  beforeEach(() => primeRubricCache(null));

  it('still shows the coach rationale when the explainer failed to load', () => {
    // The rationale is the leader's own content and has nothing to do with the
    // rubric. Hiding it because an explainer fetch failed would remove the one
    // part of the expansion that is about THEIR session.
    render(<DimensionRow dim={DIM} />);
    fireEvent.click(screen.getByTestId('coach-dim-1'));
    expect(
      screen.getByText(/Solid blueprint, one gap at the recap/),
    ).toBeInTheDocument();
  });

  it('still shows the score, without inventing an explainer', () => {
    render(<DimensionRow dim={DIM} />);
    fireEvent.click(screen.getByTestId('coach-dim-1'));
    expect(screen.getAllByText(/4\/5/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/All 10 steps/)).toBeNull();
  });
});

describe('a not-applicable dimension', () => {
  beforeEach(() => primeRubricCache(RUBRIC));

  it('says N/A rather than showing a zero bar as a score', () => {
    render(<DimensionRow dim={{ ...DIM, score: null }} />);
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });
});
