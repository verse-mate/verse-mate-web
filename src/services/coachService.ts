/**
 * Bible-Coach portal API client.
 *
 * Talks to the VerseMate backend's coach module at `${API_BASE_URL}/coach/*`
 * (verse-mate/packages/backend-base/src/coach). Auth reuses the app's
 * `fetchWithAuth`, which attaches the existing Bearer access token and
 * transparently refreshes on 401 — so a signed-in VerseMate user is a
 * signed-in coach with no extra login step. Unlike the shared `request()`
 * helper, `fetchWithAuth` does NOT hard-redirect to /logout on auth failure,
 * so this module can render its own sign-in / not-a-coach gates.
 *
 * The three states a caller must handle:
 *   - signed out / expired      → 401  → `CoachAuthError('signed_out')`
 *   - signed in but not a coach → 403  → `CoachAuthError('not_a_coach')`
 *   - signed in coach           → 200  → data
 */

import { API_BASE_URL, fetchWithAuth } from './api';

// ─── Domain types ──────────────────────────────────────────────────────────

export interface CoachCluster {
  name: string;
  weight: number;
  /** Percentage of the cluster's max earned this session (null when all
   *  member dimensions were N/A). */
  scorePct: number | null;
  /** Weighted points this cluster contributed to the composite. */
  contribution: number;
}

export interface CoachDimension {
  n: number;
  name: string;
  /** 1–5, or null for N/A (no penalty; reduces the cluster max). */
  score: number | null;
}

export interface CoachReport {
  id: string;
  date: string; // ISO yyyy-mm-dd
  dateLabel: string; // "June 13, 2026"
  session: string;
  topic: string;
  duration: string;
  attendees: number;
  newcomers: number;
  score: number; // 0–100 weighted composite + bonuses
  base: number;
  newcomerBonus: number;
  sizeBonus: number;
  status: string; // Exceptional | Strong | On Target | Developing | Early Stage
  statusEmoji: string;
  clusters: CoachCluster[];
  dimensions: CoachDimension[];
  bigIdeas: string[];
  docUrl: string;
  pdfUrl: string;
}

export interface CoachProfile {
  id: string;
  name: string;
  email: string;
  group: string;
  coachName: string;
}

export interface StatusBand {
  min: number;
  label: string;
  emoji: string;
}

export interface CoachMe {
  isCoach: true;
  profile: CoachProfile;
  zoomLink: string;
  model: string;
  clusters: { name: string; weight: number }[];
  statusBands: StatusBand[];
}

export interface ScorePoint {
  date: string;
  dateLabel: string;
  session: string;
  score: number;
  status: string;
}

/** Row shape for the cluster + dimension trend charts: a date plus one
 *  numeric key per cluster / dimension name. */
export type TrendRow = { date: string; dateLabel: string } & Record<string, number | string | null>;

export interface CoachTrends {
  scoreSeries: ScorePoint[];
  clusterSeries: TrendRow[];
  dimensionSeries: TrendRow[];
  delta: {
    score: number;
    from: number;
    to: number;
    fromLabel: string;
    toLabel: string;
  } | null;
}

// ─── Errors ────────────────────────────────────────────────────────────────

export type CoachAuthReason = 'signed_out' | 'not_a_coach';

export class CoachAuthError extends Error {
  constructor(public reason: CoachAuthReason) {
    super(reason);
    this.name = 'CoachAuthError';
  }
}

// ─── Requests ──────────────────────────────────────────────────────────────

async function coachRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetchWithAuth(`${API_BASE_URL}/coach/${path}`, {
    ...init,
    headers: { accept: 'application/json', ...(init.headers || {}) },
  });
  if (res.status === 401) throw new CoachAuthError('signed_out');
  if (res.status === 403) throw new CoachAuthError('not_a_coach');
  if (!res.ok) throw new Error(`coach api ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

/** GET /api/coach/me — profile + saved Zoom link + model metadata. */
export function fetchCoachMe(): Promise<CoachMe> {
  return coachRequest<CoachMe>('me');
}

/** GET /api/coach/reports — this coach's feedback documents, newest first. */
export async function fetchCoachReports(): Promise<CoachReport[]> {
  const data = await coachRequest<{ reports: CoachReport[] }>('reports');
  return data.reports || [];
}

/** GET /api/coach/trends — derived score / cluster / dimension series. */
export function fetchCoachTrends(): Promise<CoachTrends> {
  return coachRequest<CoachTrends>('trends');
}

/** PUT /api/coach/zoom-link — persist the coach's meeting link. */
export async function saveCoachZoomLink(zoomLink: string): Promise<string> {
  const data = await coachRequest<{ zoomLink: string }>('zoom-link', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ zoomLink }),
  });
  return data.zoomLink;
}

// ─── Small view helpers (shared across the coach screens) ──────────────────

/** Brand-aligned color for a status label. Gold = the app's accent for the
 *  top band; the rest step down through green/amber/orange/red. */
export function statusColor(status: string): string {
  switch (status) {
    case 'Exceptional':
      return 'var(--vm-dust)'; // brand gold
    case 'Strong':
      return '#15803D';
    case 'On Target':
      return '#B08900';
    case 'Developing':
      return '#C2620F';
    default:
      return '#B91C1C';
  }
}
