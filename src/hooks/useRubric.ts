import { useEffect, useState } from 'react';

import { type RubricContract, fetchRubric } from '@/services/rubric';

/**
 * The served rubric, fetched once per page load (change: port-coach-pipeline,
 * tasks 8.1-8.3).
 *
 * Cached at module level rather than per component: the contract is the same
 * for every viewer and does not change between renders, and half a dozen coach
 * components need it. Without the cache, opening the dashboard would fetch the
 * same definition once per chart.
 */

let cached: RubricContract | null = null;
let inFlight: Promise<RubricContract> | null = null;

export function primeRubricCache(contract: RubricContract | null): void {
  cached = contract;
  inFlight = null;
}

export function loadRubric(): Promise<RubricContract> {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = fetchRubric()
      .then((r) => {
        cached = r;
        return r;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export interface UseRubric {
  rubric: RubricContract | null;
  /** True until the first answer arrives. */
  loading: boolean;
  error: Error | null;
}

export function useRubric(): UseRubric {
  const [rubric, setRubric] = useState<RubricContract | null>(cached);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cached) return;
    let alive = true;
    loadRubric()
      .then((r) => {
        if (!alive) return;
        setRubric(r);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        // A missing rubric must not blank the dashboard: the scores are still
        // the leader's, and a screen that renders nothing because an explainer
        // failed to load is worse than one without explainers.
        setError(e instanceof Error ? e : new Error(String(e)));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { rubric, loading, error };
}

/** Cluster display order, from the served definition. */
export function clusterOrder(rubric: RubricContract | null): string[] {
  return (rubric?.clusters ?? []).map((c) => c.name);
}

/**
 * A cluster's short code, the first letters of its words.
 *
 * DERIVED, not a lookup table: the portal held a hardcoded TC/BM/EP/BR map in
 * two files, so renaming or adding a cluster meant editing both and the
 * per-session table would silently keep the old code.
 */
export function shortCode(clusterName: string): string {
  return clusterName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Reverse of shortCode, against the served clusters. */
export function clusterForCode(
  code: string,
  rubric: RubricContract | null,
): string | undefined {
  return (rubric?.clusters ?? []).find(
    (c) => shortCode(c.name) === code.toUpperCase(),
  )?.name;
}
