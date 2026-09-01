import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RubricContract } from '@/services/rubric';
import {
  clusterForCode,
  clusterOrder,
  loadRubric,
  primeRubricCache,
  shortCode,
} from './useRubric';

const CONTRACT: RubricContract = {
  model: 'v3-weighted-100',
  clusters: [
    { name: 'Teaching Craft', weight: 33 },
    { name: 'Building Ministry', weight: 31 },
    { name: 'Engaging People', weight: 18 },
    { name: 'Being Real', weight: 18 },
  ],
  dimensions: [],
  statusBands: [],
  dimensionBands: [],
};

beforeEach(() => {
  primeRubricCache(null);
  vi.restoreAllMocks();
});

describe('the rubric is fetched once, not once per chart', () => {
  it('a second load reuses the first answer', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(CONTRACT), { status: 200 }),
    );
    await loadRubric();
    await loadRubric();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('concurrent loads share ONE request', async () => {
    // Half a dozen coach components mount at once; without this the dashboard
    // would fetch the same definition six times.
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(CONTRACT), { status: 200 }),
    );
    await Promise.all([loadRubric(), loadRubric(), loadRubric()]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('a failure is not cached — the next attempt retries', async () => {
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('nope', { status: 500 }))
      .mockResolvedValue(new Response(JSON.stringify(CONTRACT), { status: 200 }));
    await expect(loadRubric()).rejects.toThrow();
    const rubric = await loadRubric();
    expect(rubric.clusters).toHaveLength(4);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('cluster codes are derived, not tabulated', () => {
  it('takes the initials of the served name', () => {
    // The portal held a hardcoded TC/BM/EP/BR map in TWO files, so renaming or
    // adding a cluster meant editing both — and the per-session table would
    // silently keep the old code.
    expect(shortCode('Teaching Craft')).toBe('TC');
    expect(shortCode('Building Ministry')).toBe('BM');
    expect(shortCode('Engaging People')).toBe('EP');
    expect(shortCode('Being Real')).toBe('BR');
  });

  it('a renamed cluster gets the right code with no portal edit', () => {
    expect(shortCode('Prayerful Leadership')).toBe('PL');
  });

  it('resolves a code back to the served cluster', () => {
    expect(clusterForCode('bm', CONTRACT)).toBe('Building Ministry');
    expect(clusterForCode('ZZ', CONTRACT)).toBeUndefined();
  });

  it('order comes from the served list, not a hardcoded array', () => {
    expect(clusterOrder(CONTRACT)).toEqual([
      'Teaching Craft',
      'Building Ministry',
      'Engaging People',
      'Being Real',
    ]);
  });

  it('with no rubric loaded, order is empty rather than a stale guess', () => {
    expect(clusterOrder(null)).toEqual([]);
  });
});
