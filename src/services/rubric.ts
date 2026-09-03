import { API_BASE_URL } from './api';

/**
 * The rubric contract, served by the backend (change: port-coach-pipeline,
 * tasks 8.1-8.3).
 *
 * Everything here used to be hand-maintained in the portal, `dimensionInfo.ts`
 * held the dimension explainers and cluster mapping, `dashboardTheme.ts` and
 * `CoachTrendCharts.tsx` held cluster names and the bm/tc/ep/br keys,
 * `CoachAdminScreen.tsx` held band labels, and `coachService.statusColor` held
 * the bands again. Five copies of one definition, none of which computed
 * anything: a weight could change in the backend and the portal would keep
 * showing a breakdown that did not add up to the leader's own score.
 *
 * Now it is fetched. The portal renders what computed the score.
 */

export interface RubricCluster {
  name: string;
  weight: number;
}

export interface RubricDimension {
  n: number;
  name: string;
  cluster: string;
  clusterWeight: number;
  /** What the dimension measures, in plain English. */
  what: string;
  /** The research-backed target it is scored against. */
  target: string;
}

export interface StatusBand {
  min: number;
  label: string;
  emoji: string;
}

export interface RubricContract {
  model: string;
  clusters: RubricCluster[];
  dimensions: RubricDimension[];
  statusBands: StatusBand[];
  dimensionBands: Array<{ min: number; label: string }>;
}

/**
 * GET /coach/rubric.
 *
 * Deliberately NOT behind the coach auth gate: it describes the scoring model,
 * carries no leader data, and the explainer has to render for anyone who can
 * already see a score.
 */
export async function fetchRubric(): Promise<RubricContract> {
  const res = await fetch(`${API_BASE_URL}/coach/rubric`, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`coach rubric failed: ${res.status}`);
  return (await res.json()) as RubricContract;
}

/** The band a composite score falls in, from the SERVED bands. */
export function statusForScore(
  score: number,
  bands: StatusBand[],
): StatusBand | undefined {
  return bands.find((b) => score >= b.min) ?? bands[bands.length - 1];
}

/**
 * Plain-English read of a single 1-5 dimension score, from the SERVED labels.
 *
 * Replaces the portal's own `scoreBand`: the labels move with the definition
 * rather than being restated next to it.
 */
export function dimensionBandLabel(
  score: number | null,
  bands: Array<{ min: number; label: string }>,
): string {
  if (score == null) return 'Not applicable this session';
  const band = bands.find((b) => score >= b.min);
  return band?.label ?? bands[bands.length - 1]?.label ?? '';
}

/** Dimensions grouped under their cluster, in the served cluster order. */
export function dimensionsByCluster(
  rubric: RubricContract,
): Array<{ cluster: RubricCluster; dimensions: RubricDimension[] }> {
  return rubric.clusters.map((cluster) => ({
    cluster,
    dimensions: rubric.dimensions.filter((d) => d.cluster === cluster.name),
  }));
}
