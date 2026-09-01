import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type RubricContract,
  dimensionBandLabel,
  dimensionsByCluster,
  fetchRubric,
  statusForScore,
} from './rubric';

const CONTRACT: RubricContract = {
  model: 'v3-weighted-100',
  clusters: [
    { name: 'Teaching Craft', weight: 33 },
    { name: 'Building Ministry', weight: 31 },
    { name: 'Engaging People', weight: 18 },
    { name: 'Being Real', weight: 18 },
  ],
  dimensions: [
    {
      n: 1,
      name: 'Session Structure & Flow',
      cluster: 'Teaching Craft',
      clusterWeight: 33,
      what: 'How well the session follows the blueprint.',
      target: 'All 10 steps, well-paced',
    },
    {
      n: 2,
      name: 'Newcomer Welcome',
      cluster: 'Building Ministry',
      clusterWeight: 31,
      what: 'Time spent welcoming newcomers.',
      target: '7-25 min with member testimonies',
    },
  ],
  statusBands: [
    { min: 85, label: 'Exceptional', emoji: '🔷' },
    { min: 72, label: 'Strong', emoji: '🟢' },
    { min: 60, label: 'On Target', emoji: '🟡' },
    { min: 45, label: 'Developing', emoji: '🟠' },
    { min: 0, label: 'Early Stage', emoji: '🔴' },
  ],
  dimensionBands: [
    { min: 5, label: 'Exemplary' },
    { min: 4, label: 'Strong' },
    { min: 3, label: 'On target' },
    { min: 2, label: 'Developing' },
    { min: 1, label: 'Early stage' },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the portal reads the rubric instead of keeping one', () => {
  it('fetches the contract from the backend', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(CONTRACT), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const rubric = await fetchRubric();
    expect(rubric.clusters).toHaveLength(4);
    expect(fetchSpy.mock.calls[0][0]).toContain('/coach/rubric');
  });

  it('does NOT send credentials — the explainer is not leader data', async () => {
    // It describes the scoring model, so it must render for anyone who can
    // already see a score.
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(CONTRACT), { status: 200 }),
    );
    await fetchRubric();
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(JSON.stringify(init.headers ?? {})).not.toContain('Authorization');
  });

  it('a failing request throws rather than returning a half rubric', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('nope', { status: 500 }),
    );
    await expect(fetchRubric()).rejects.toThrow(/rubric/);
  });
});

describe('band labels come from the served definition', () => {
  it('reads a composite score into its band', () => {
    expect(statusForScore(90, CONTRACT.statusBands)?.label).toBe('Exceptional');
    expect(statusForScore(78.1, CONTRACT.statusBands)?.label).toBe('Strong');
    expect(statusForScore(0, CONTRACT.statusBands)?.label).toBe('Early Stage');
  });

  it('reads a 1-5 dimension score into its label', () => {
    expect(dimensionBandLabel(5, CONTRACT.dimensionBands)).toBe('Exemplary');
    expect(dimensionBandLabel(3, CONTRACT.dimensionBands)).toBe('On target');
  });

  it('a not-applicable dimension says so rather than scoring zero', () => {
    expect(dimensionBandLabel(null, CONTRACT.dimensionBands)).toBe(
      'Not applicable this session',
    );
  });

  it('a changed weight or label flows through with no portal edit', () => {
    // The single-source property from the portal's side: these functions read
    // the served arrays, so a backend change reaches the UI without anyone
    // editing the portal.
    const renamed = {
      ...CONTRACT,
      statusBands: [{ min: 0, label: 'Renamed band', emoji: '⭐' }],
    };
    expect(statusForScore(90, renamed.statusBands)?.label).toBe('Renamed band');
  });
});

describe('the cluster breakdown a leader sees', () => {
  it('groups dimensions under the SERVED clusters, in the served order', () => {
    const grouped = dimensionsByCluster(CONTRACT);
    expect(grouped.map((g) => g.cluster.name)).toEqual([
      'Teaching Craft',
      'Building Ministry',
      'Engaging People',
      'Being Real',
    ]);
    expect(grouped[0].dimensions.map((d) => d.n)).toEqual([1]);
    expect(grouped[1].dimensions.map((d) => d.n)).toEqual([2]);
  });

  it('carries each dimension explainer and target, so the detail survives', () => {
    // Task 8.2 deletes dimensionInfo.ts; without these fields on the wire the
    // expandable dimension detail would simply disappear.
    const grouped = dimensionsByCluster(CONTRACT);
    const first = grouped[0].dimensions[0];
    expect(first.what.length).toBeGreaterThan(0);
    expect(first.target.length).toBeGreaterThan(0);
  });

  it('a cluster with no dimensions still appears, rather than vanishing', () => {
    const grouped = dimensionsByCluster(CONTRACT);
    const empty = grouped.find((g) => g.cluster.name === 'Being Real');
    expect(empty).toBeDefined();
    expect(empty?.dimensions).toEqual([]);
  });
});
