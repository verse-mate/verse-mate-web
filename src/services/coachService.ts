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
  /** Coach's rationale for this session's score ("why this score"); may be empty. */
  note?: string;
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
  /** Coaching feedback rendered directly on the page (no Google Docs hop). */
  feedback: CoachFeedback;
  /** Additional named report sections straight from the pipeline — e.g. "Key
   *  moments", "Session flow timeline", "Vulnerability moments". Optional and
   *  ordered; the desktop report renders each in order after the recommendations
   *  so the portal can match the depth of the full PDF without further UI work
   *  as the pipeline adds sections. */
  sections?: CoachReportSection[];
  docUrl: string;
  pdfUrl: string;
  /** Admin-editable recording URL for this session (Zoom / Fireflies / Drive).
   *  Empty string when none set. */
  recordingUrl?: string;
  /** Coaching notes on this session, newest first. Shown editable to admins
   *  (composer + history) and read-only to the leader on their dashboard. */
  notes?: CoachNote[];
}

/** A coaching note on a session — written by an admin, emailed to the leader. */
export interface CoachNote {
  id: string;
  body: string;
  createdAt: string; // ISO timestamp
  /** True once the note was handed to the mailer. */
  emailed: boolean;
}

/** One timestamped moment within a report section (e.g. a key moment or a
 *  point on the session-flow timeline). */
export interface CoachMoment {
  /** Source timestamp, e.g. "[50:03]" or "55:18–58:18". Optional. */
  timestamp?: string;
  /** What happened. */
  detail: string;
}

/** A free-form report section from the pipeline. Any combination of prose
 *  paragraphs, bullet points, and timestamped moments — whatever the section
 *  needs — so new PDF sections surface on the portal without a schema change. */
export interface CoachReportSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  moments?: CoachMoment[];
}

/** One fully-written coaching point: a short title plus prose paragraphs.
 *  Emitted directly by the Bible-Coach pipeline (no Google Docs hop) so the
 *  portal can render the complete narrative on-page. */
export interface CoachFeedbackPoint {
  /** Short heading for the point, e.g. "Exceptional discussion balance". */
  title: string;
  /** The full write-up, one string per paragraph. */
  paragraphs: string[];
}

export interface CoachFeedback {
  headline: string;
  /** Terse one-line bullets — the compact (mobile) presentation. */
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  /** Full prose straight from the coaching pipeline — the expanded (desktop)
   *  presentation. All optional: a report generated before prose export simply
   *  falls back to the terse bullets above, so old and new data both render. */
  overview?: string[];
  strengthsProse?: CoachFeedbackPoint[];
  improvementsProse?: CoachFeedbackPoint[];
  recommendationsProse?: CoachFeedbackPoint[];
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

/** Allowed recurrence keywords for a class (mirrors the backend DTO). */
export type CoachClassRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

/** One registered class. Its `zoomLink` is a meeting the coaching Notetaker
 *  bot joins; a leader can register several. */
export interface CoachClass {
  id: string;
  name: string;
  /** ISO yyyy-mm-dd, or null when no date is pinned (recurrence only). */
  classDate: string | null;
  recurrence: CoachClassRecurrence;
  zoomLink: string;
}

/** Fields a caller sends when creating / updating a class. `classDate` is an
 *  ISO yyyy-mm-dd string or '' (no pinned date). */
export interface CoachClassInput {
  name: string;
  classDate: string;
  recurrence: CoachClassRecurrence;
  zoomLink: string;
}

/** One class in the admin all-leaders export — the class plus the leader it
 *  belongs to. This is the single feed the Fireflies bot's auto-joins are
 *  configured from, so admins can see every meeting link across the cohort. */
export interface AdminCoachClass extends CoachClass {
  leader: { id: string | null; name: string; email: string };
}

export interface CoachMe {
  /** True when the signed-in account maps to an evaluated leader. */
  isCoach: boolean;
  /** True for program admins — oversight over every leader. */
  isAdmin: boolean;
  /** The leader's own record; null for an admin who isn't a coachee. */
  profile: CoachProfile | null;
  zoomLink: string;
  /** The leader's affiliated church (free-form; empty when unset). */
  affiliatedChurch: string;
  /** The leader's selected Bible coach (empty → portal defaults to Bryan). */
  bibleCoach: string;
  model: string;
  clusters: { name: string; weight: number }[];
  statusBands: StatusBand[];
}

/** One row in the admin oversight roster. */
export interface CoachSummary {
  id: string;
  name: string;
  group: string;
  coachName: string;
  sessionCount: number;
  latest: {
    date: string;
    dateLabel: string;
    score: number;
    status: string;
    statusEmoji: string;
  } | null;
}

/** Header identifying which leader an admin is viewing. */
export interface CoachProfileHeader {
  id: string;
  name: string;
  group: string;
  coachName: string;
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

// ─── Admin oversight (program admins only) ─────────────────────────────────

/** GET /coach/admin/coaches — every leader's roster summary. 403 for
 *  non-admins → surfaces as CoachAuthError('not_a_coach'). */
export async function fetchAdminCoaches(): Promise<CoachSummary[]> {
  const data = await coachRequest<{ coaches: CoachSummary[] }>('admin/coaches');
  return data.coaches || [];
}

/** GET /coach/admin/coaches/:id/reports — a specific leader's documents. */
export function fetchCoachReportsFor(
  coachId: string,
): Promise<{ profile: CoachProfileHeader; reports: CoachReport[] }> {
  return coachRequest<{ profile: CoachProfileHeader; reports: CoachReport[] }>(
    `admin/coaches/${encodeURIComponent(coachId)}/reports`,
  );
}

/** GET /coach/admin/coaches/:id/trends — a specific leader's trends. */
export function fetchCoachTrendsFor(coachId: string): Promise<CoachTrends> {
  return coachRequest<CoachTrends>(`admin/coaches/${encodeURIComponent(coachId)}/trends`);
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

// ─── Classes (Class Setup) ──────────────────────────────────────────────────

/** GET /api/coach/classes — this coach's registered classes, newest-edited
 *  first. */
export async function fetchCoachClasses(): Promise<CoachClass[]> {
  const data = await coachRequest<{ classes: CoachClass[] }>('classes');
  return data.classes || [];
}

/** POST /api/coach/classes — register a new class. */
export async function createCoachClass(input: CoachClassInput): Promise<CoachClass> {
  const data = await coachRequest<{ class: CoachClass }>('classes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.class;
}

/** PUT /api/coach/classes/:id — update an existing class. */
export async function updateCoachClass(id: string, input: CoachClassInput): Promise<CoachClass> {
  const data = await coachRequest<{ class: CoachClass }>(`classes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.class;
}

/** DELETE /api/coach/classes/:id — remove a class. */
export async function deleteCoachClass(id: string): Promise<void> {
  await coachRequest<{ success: boolean }>(`classes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/** GET /coach/admin/classes — every leader's classes with owner identity
 *  (admin only; 403 for non-admins). The single feed the Fireflies bot's
 *  auto-joins are configured from. */
export async function fetchAllCoachClasses(): Promise<AdminCoachClass[]> {
  const data = await coachRequest<{ classes: AdminCoachClass[] }>('admin/classes');
  return data.classes || [];
}

/** PUT /api/coach/affiliated-church — persist the coach's affiliated church. */
export async function saveCoachAffiliatedChurch(affiliatedChurch: string): Promise<string> {
  const data = await coachRequest<{ affiliatedChurch: string }>('affiliated-church', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ affiliatedChurch }),
  });
  return data.affiliatedChurch;
}

/** PUT /api/coach/bible-coach — persist the coach's selected Bible coach. */
export async function saveCoachBibleCoach(bibleCoach: string): Promise<string> {
  const data = await coachRequest<{ bibleCoach: string }>('bible-coach', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ bibleCoach }),
  });
  return data.bibleCoach;
}

/** Bible coaches a leader can be paired with. Bryan is the only option today;
 *  the list grows as more coaches join, and the picker defaults to Bryan. */
export const BIBLE_COACHES = ['Bryan Bailey'] as const;
export const DEFAULT_BIBLE_COACH = BIBLE_COACHES[0];

// ─── Admin writes: add leader · recording link · notes ─────────────────────

/** POST /coach/admin/leaders — add a leader by email (+ optional name/group).
 *  The backend sends them an invite email. Returns the new roster summary. */
export async function addCoachLeader(input: {
  email: string;
  name?: string;
  group?: string;
  coachName?: string;
}): Promise<CoachSummary> {
  const data = await coachRequest<{ coach: CoachSummary }>('admin/leaders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.coach;
}

/** PUT a session's recording URL. Empty string clears it. */
export async function saveRecordingLink(
  coachId: string,
  reportId: string,
  recordingUrl: string,
): Promise<string> {
  const data = await coachRequest<{ recordingUrl: string }>(
    `admin/coaches/${encodeURIComponent(coachId)}/reports/${encodeURIComponent(reportId)}/recording`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recordingUrl }),
    },
  );
  return data.recordingUrl;
}

/** POST a coaching note on a session — persisted + emailed to the leader. */
export async function addCoachNote(
  coachId: string,
  reportId: string,
  body: string,
): Promise<CoachNote> {
  const data = await coachRequest<{ note: CoachNote }>(
    `admin/coaches/${encodeURIComponent(coachId)}/reports/${encodeURIComponent(reportId)}/notes`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body }),
    },
  );
  return data.note;
}

// ─── Monthly cross-leader analysis ─────────────────────────────────────────

export interface MonthlyLeader {
  id: string;
  name: string;
  group: string;
  sessions: number;
  avgScore: number | null;
  status: string;
  statusEmoji: string;
  dimensions: { n: number; name: string; avg: number | null }[];
  delta: number | null;
}

export interface CoachMonthly {
  month: string; // "2026-07"
  monthLabel: string; // "July 2026"
  program: {
    sessions: number;
    activeLeaders: number;
    newcomers: number;
    avgScore: number | null;
    clusters: { name: string; weight: number; avg: number | null }[];
    delta: number | null;
  };
  leaders: MonthlyLeader[];
  /** Every YYYY-MM month with at least one report, newest first. Drives the
   *  month picker so only months that were actually done are selectable. */
  availableMonths: string[];
  /** Program-wide narrative prose for the month (Executive Summary + Trends),
   *  or null. Comes straight from the coaching pipeline's shared generator, so
   *  this reads identically to the monthly PDF. */
  narrative: MonthlyNarrative | null;
}

/** Program-wide monthly narrative — the same prose the monthly PDF carries. */
export interface MonthlyNarrative {
  executiveSummary: string[];
  trends: string[];
}

/** GET /coach/admin/monthly?month=YYYY-MM — program-wide + per-leader rollup. */
export function fetchAdminMonthly(month: string): Promise<CoachMonthly> {
  return coachRequest<CoachMonthly>(`admin/monthly?month=${encodeURIComponent(month)}`);
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

/**
 * Turn a report's `pdfUrl` into a link that *downloads* the coach-produced PDF
 * rather than opening a Drive viewer or a folder.
 *
 * The pipeline stores each session's `pdfUrl` as a Google Drive / Docs share
 * URL. A `/view` (or `/edit`) link opens the online viewer; we rewrite it to
 * the direct-download form so the button saves the file. Returns `null` when
 * there is no real per-session PDF to download — an empty value, or a Drive
 * *folder* link (the exporter's fallback when a session has no captured PDF) —
 * so callers can hide the button instead of dropping the user in a folder.
 */
export function pdfDownloadUrl(pdfUrl: string | undefined): string | null {
  const url = pdfUrl?.trim();
  if (!url) return null;

  // A Drive folder link is not a downloadable file — treat as "no PDF".
  if (/drive\.google\.com\/drive\/folders\//i.test(url)) return null;

  // Google Docs/Sheets/Slides → native PDF export.
  const docs = url.match(/docs\.google\.com\/\w+\/d\/([\w-]+)/i);
  if (docs) return `https://docs.google.com/document/d/${docs[1]}/export?format=pdf`;

  // Drive file link (`/file/d/ID/...` or `?id=ID` / `&id=ID`) → direct download.
  const fileId = url.match(/\/file\/d\/([\w-]+)/i)?.[1] ?? url.match(/[?&]id=([\w-]+)/i)?.[1];
  if (fileId) return `https://drive.google.com/uc?export=download&id=${fileId}`;

  // Some other absolute link (e.g. a direct PDF URL) — hand it back unchanged.
  if (/^https?:\/\//i.test(url)) return url;
  return null;
}
