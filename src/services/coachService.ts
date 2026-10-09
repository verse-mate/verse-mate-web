/**
 * Bible-Coach portal API client.
 *
 * Talks to the VerseMate backend's coach module at `${API_BASE_URL}/coach/*`
 * (verse-mate/packages/backend-base/src/coach). Auth reuses the app's
 * `fetchWithAuth`, which attaches the existing Bearer access token and
 * transparently refreshes on 401, so a signed-in VerseMate user is a
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
import { spreadOver } from './rubric';

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
  status: string;
  statusEmoji: string;
  clusters: CoachCluster[];
  dimensions: CoachDimension[];
  bigIdeas: string[];
  /** Coaching feedback rendered directly on the page (no Google Docs hop). */
  feedback: CoachFeedback;
  /** Additional named report sections straight from the pipeline, e.g. "Key
   *  moments", "Session flow timeline", "Vulnerability moments". Optional and
   *  ordered; the desktop report renders each in order after the recommendations
   *  so the portal can match the depth of the full PDF without further UI work
   *  as the pipeline adds sections. */
  sections?: CoachReportSection[];
  recordingUrl?: string;
  attachedRecordingUrl?: string | null;
  /**
   * DETAIL-ONLY (task 4.5). Whether VerseMate holds a recording for this
   * session, never WHERE it is. The address is minted per session by
   * `mintRecordingUrl`, so opening a list mints nothing.
   */
  hasRetainedRecording?: boolean;
  /** Coaching notes on this session, newest first. Shown editable to admins
   *  (composer + history) and read-only to the leader on their dashboard. */
  notes?: CoachNote[];
}

/** A coaching note on a session, written by an admin, emailed to the leader. */
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
 *  paragraphs, bullet points, and timestamped moments, whatever the section
 *  needs, so new PDF sections surface on the portal without a schema change. */
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
  /** Terse one-line bullets, the compact (mobile) presentation. */
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  /** Full prose straight from the coaching pipeline, the expanded (desktop)
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

/** One class in the admin all-leaders export, the class plus the leader it
 *  belongs to. This is the single feed the Fireflies bot's auto-joins are
 *  configured from, so admins can see every meeting link across the cohort. */
export interface AdminCoachClass extends CoachClass {
  leader: { id: string | null; name: string; email: string };
}

export interface CoachMe {
  /** True when the signed-in account maps to an evaluated leader. */
  isCoach: boolean;
  /** True for program admins, oversight over every leader. */
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

/** An address change an admin asked for that has not taken effect. */
export interface AddressChange {
  newEmail: string;
  state: 'pending' | 'expired' | 'refused';
  reason: string | null;
  requestedAt: string;
  expiresAt: string;
}

/** One row in the admin oversight roster. */
export interface CoachSummary {
  id: string;
  name: string;
  group: string;
  coachName: string;
  sessionCount: number;
  addressChange?: AddressChange | null;
  latest: {
    date: string;
    dateLabel: string;
    score: number;
    status: string;
    statusEmoji: string;
  } | null;
}

export interface ScorePoint {
  date: string;
  dateLabel: string;
  session: string;
  score: number;
  status: string;
  reportId?: string;
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

export class CoachApiError extends Error {
  constructor(
    path: string,
    public status: number,
    public serverMessage: string,
    public details: Record<string, unknown> = {},
  ) {
    super(`coach api ${path} failed: ${status}`);
    this.name = 'CoachApiError';
  }
}

export const COLD_RECALL_WHY = 'a first lesson cannot carry an improvement that asks for recall of earlier lessons';

const REFUSAL_WORDS: Record<string, string> = {
  'send-failed': 'the mail service did not take it for every recipient',
  'governance-blocked': 'it breaks a governance rule',
  'cold-recall-improvement': COLD_RECALL_WHY,
  'awaiting-release': 'it is held until an admin releases it',
  'already-delivered': 'it was already delivered',
  'in-flight': 'another request is delivering it right now',
  'unknown-report': 'the report no longer exists',
  'parallel-run': 'the pipeline is in its parallel run, so nothing is sent until cutover',
  'parallel-run-session': 'this session was observed during the parallel run, so it is kept for comparison and never sent',
  'no-mailer': 'no mailer is configured',
};

export function refusalWords(code: string | undefined): string {
  return REFUSAL_WORDS[code ?? ''] ?? `the server refused it for a reason this page does not know (${code ?? 'none given'})`;
}

export function refusalCode(err: unknown): string | undefined {
  return err instanceof CoachApiError && typeof err.details.refusal === 'string' ? err.details.refusal : undefined;
}

export function refusalText(err: unknown): string {
  if (err instanceof CoachAuthError) return 'Refused: this account does not have admin access.';
  if (err instanceof CoachApiError) {
    const kind = err.status >= 500 ? 'Server error' : 'Refused';
    return `${kind} (${err.status})${err.serverMessage ? `: ${err.serverMessage}` : ''}`;
  }
  return 'The request failed.';
}

// ─── Requests ──────────────────────────────────────────────────────────────

async function coachRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetchWithAuth(`${API_BASE_URL}/coach/${path}`, {
    ...init,
    headers: { accept: 'application/json', ...(init.headers || {}) },
  });
  if (res.status === 401) throw new CoachAuthError('signed_out');
  if (res.status === 403) throw new CoachAuthError('not_a_coach');
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string; details?: Record<string, unknown> } | null;
    throw new CoachApiError(path, res.status, body?.message ?? '', body?.details ?? {});
  }
  return (await res.json()) as T;
}

/** GET /api/coach/me, profile + saved Zoom link + model metadata. */
export function fetchCoachMe(): Promise<CoachMe> {
  return coachRequest<CoachMe>('me');
}

export type CoachReportSummary = Pick<
  CoachReport,
  | 'id'
  | 'date'
  | 'dateLabel'
  | 'session'
  | 'topic'
  | 'score'
  | 'status'
  | 'statusEmoji'
  | 'hasRetainedRecording'
  | 'attachedRecordingUrl'
> & { held?: boolean };

export interface CoachReportSummaryPage {
  items: CoachReportSummary[];
  total: number;
  streakWeeks: number;
  quarterSessions: number;
}

export const REPORT_PAGE_SIZE = 50;

function reportsPath(coachId?: string): string {
  return coachId ? `admin/coaches/${encodeURIComponent(coachId)}/reports` : 'reports';
}

export async function fetchCoachReportSummaries(
  offset = 0,
  limit = REPORT_PAGE_SIZE,
  coachId?: string,
): Promise<CoachReportSummaryPage> {
  const data = await coachRequest<Partial<CoachReportSummaryPage>>(
    `${reportsPath(coachId)}/summary?limit=${limit}&offset=${offset}`,
  );
  return {
    items: data.items || [],
    total: data.total ?? 0,
    streakWeeks: data.streakWeeks ?? 0,
    quarterSessions: data.quarterSessions ?? 0,
  };
}

export async function fetchCoachReportDetail(
  reportId: string,
  coachId?: string,
): Promise<CoachReport | null> {
  try {
    const data = await coachRequest<{ report: CoachReport }>(
      `${reportsPath(coachId)}/${encodeURIComponent(reportId)}`,
    );
    return data.report ?? null;
  } catch (err) {
    if (err instanceof CoachApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * Mint a short-lived address for ONE session's retained recording.
 *
 * Called at PLAYBACK START, not at render: an address minted when a detail view
 * opens is already spent by the time someone left the tab and came back, and
 * minting per rendered row would sign one URL per session on every page load.
 */
export async function mintRecordingUrl(
  reportId: string,
): Promise<{ url: string; expiresInSeconds: number } | null> {
  try {
    return await coachRequest<{ url: string; expiresInSeconds: number }>(
      `reports/${encodeURIComponent(reportId)}/recording-url`,
    );
  } catch {
    // Every refusal looks the same by design (no session, not yours, nothing
    // retained), so there is nothing to distinguish here either.
    return null;
  }
}

/** A session whose recording could not be retrieved (tasks 4.9a, 8.5a). */
export interface PendingReshare {
  sourceSessionId: string;
  coachId: string | null;
  title: string;
  sessionDate: string;
  sessionStartedAt: string | null;
  requestedAt: string;
  attempts: number;
  /** True once the leader has actually been emailed about this session. */
  asked: boolean;
  parallelRun: boolean;
}

/** GET /api/coach/admin/reshares, admin only. */
export async function fetchPendingReshares(): Promise<PendingReshare[]> {
  const data = await coachRequest<{ requests: PendingReshare[] }>(
    'admin/reshares',
  );
  return data.requests || [];
}

/** POST /api/coach/admin/reshares/:id/send, asks the leader to re-share. */
export function sendReshareRequest(sourceSessionId: string): Promise<{ sent: boolean }> {
  return coachRequest<{ sent: boolean }>(
    `admin/reshares/${encodeURIComponent(sourceSessionId)}/send`,
    { method: 'POST' },
  );
}

/**
 * POST /api/coach/admin/reshares/:id/resolve, the session re-enters
 * retrieval. Intake idempotence means the report it eventually produces is not
 * a duplicate.
 */
export function resolveReshareRequest(
  sourceSessionId: string,
): Promise<{ resolved: boolean }> {
  return coachRequest<{ resolved: boolean }>(
    `admin/reshares/${encodeURIComponent(sourceSessionId)}/resolve`,
    { method: 'POST' },
  );
}

export function sessionDateText(session: { sessionDate: string; sessionStartedAt: string | null }): string {
  if (!session.sessionStartedAt) return session.sessionDate;
  const time = new Date(session.sessionStartedAt).toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  return `${session.sessionDate} · started ${time}`;
}

export const PARALLEL_RUN_COPY = 'Parallel-run copy: kept for comparison, never sent.';

export type HoldKind = 'review' | 'reattributed' | 'governance' | 'cold-recall' | 'no-mailer' | 'send-failed' | 'scoring-version';

export interface PipelineFailure {
  sourceSessionId: string;
  coachId: string | null;
  title: string;
  sessionDate: string;
  sessionStartedAt: string | null;
  state: string;
  attempts: number;
  reportId: string | null;
  reason: string | null;
  holdKind: HoldKind | null;
  coldRecall?: string[];
  parallelRun: boolean;
  action: 'release' | 'requeue' | 'attribute' | null;
  updatedAt: string;
}

export interface PipelineFailurePage {
  sessions: PipelineFailure[];
  total: number;
  limit: number;
  offset: number;
}

export const PIPELINE_PAGE_SIZE = 50;

export function fetchPipelineFailures(offset = 0, limit = PIPELINE_PAGE_SIZE): Promise<PipelineFailurePage> {
  return coachRequest<PipelineFailurePage>(`admin/pipeline-failures?limit=${limit}&offset=${offset}`);
}

export function requeuePipelineFailure(sourceSessionId: string): Promise<{ requeued: boolean }> {
  return coachRequest<{ requeued: boolean }>(
    `admin/pipeline-failures/${encodeURIComponent(sourceSessionId)}/requeue`,
    { method: 'POST' },
  );
}

export function attributeSession(
  sourceSessionId: string,
  coachId: string,
  expectedCoachId: string | null,
): Promise<{ coachId: string; state: string }> {
  return coachRequest<{ coachId: string; state: string }>(
    `admin/sessions/${encodeURIComponent(sourceSessionId)}/attribute`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ coachId, expectedCoachId }),
    },
  );
}

export interface ReleaseOutcome {
  delivered: boolean;
  refusal?: string;
  violations?: string[];
  coldRecall?: string[];
  skipped?: string[];
}

export function releaseHeldReport(reportId: string): Promise<ReleaseOutcome> {
  return coachRequest<ReleaseOutcome>(`admin/reports/${encodeURIComponent(reportId)}/release`, {
    method: 'POST',
  });
}

export interface ReportReviewState {
  reportId: string;
  delivered: boolean;
  base: number;
  humanCorrected: boolean;
  firstLesson: boolean;
  firstLessonSource: string | null;
  passageBook: string | null;
  parallelRun: boolean;
  dimensions: ReviewDimension[];
}

/** One dimension under review. Each of what produced it is null when it was not recorded. */
export interface ReviewDimension {
  n: number;
  score: number | null;
  rationale: string;
  provenance: string;
  /** The rubric version. */
  modelVersion: string | null;
  languageModel: string | null;
  promptVersion: string | null;
  settings: { temperature: number | null; reasoningEffort: string | null } | null;
}

export const AMENDABLE_BODY_FIELDS = ['headline', 'overview', 'strengths', 'improvements', 'recommendations'] as const;
export type AmendableBodyField = (typeof AMENDABLE_BODY_FIELDS)[number];
export const PROSE_LISTS = ['strengths', 'improvements', 'recommendations'] as const;
export type ProseList = (typeof PROSE_LISTS)[number];
export type ProseField = `${ProseList}Prose`;

export interface ReportAmendment {
  dimensions?: { n: number; score: number | null; rationale: string }[];
  firstLesson?: boolean;
  body?: Partial<Record<AmendableBodyField, string | string[]>> & Partial<Record<ProseField, CoachFeedbackPoint[]>>;
}

export interface RevisionSends {
  sends?: { email: string; delivered: boolean; error?: string; neverConfirmed?: true }[];
  skipped?: string[];
}

export interface RevisionResult extends RevisionSends {
  applied: boolean;
  refusal?: string;
  violations?: string[];
  coldRecall?: string[];
  revision?: number;
  firstLesson?: boolean;
  base?: number;
  score?: number;
  status?: string;
  sent?: boolean;
  pending?: string;
}

export interface RevisionSendResult extends RevisionSends {
  sent: boolean;
  refusal?: string;
  revision?: number;
}

type ScoreAndRationale = { score: number | null; rationale: string };

export interface ReportRevisionChanges {
  dimensions?: { n: number; from: ScoreAndRationale; to: ScoreAndRationale }[];
  firstLesson?: { from: boolean; to: boolean };
  body?: Partial<Record<AmendableBodyField | ProseField, { from: unknown; to: unknown }>>;
}

export interface ReportRevision {
  kind: 'revision';
  revision: number;
  previous: Record<string, unknown>;
  changes: ReportRevisionChanges;
  amendedBy: string | null;
  amendedAt: string;
  sentTo: string[];
  skipped: string[];
  sentAt: string | null;
  attemptedTo: string[];
}

export interface ReportEdit {
  kind: 'edit';
  edit: number;
  changes: Partial<Record<'improvements' | 'improvementsProse', { from: unknown; to: unknown }>>;
  editedBy: string | null;
  editedAt: string;
}

export type ReportVersion = ReportRevision | ReportEdit;

function adminReportPath(reportId: string, rest: string): string {
  return `admin/reports/${encodeURIComponent(reportId)}/${rest}`;
}

export async function fetchReportReview(reportId: string): Promise<ReportReviewState | null> {
  try {
    return await coachRequest<ReportReviewState>(adminReportPath(reportId, 'review'));
  } catch (err) {
    if (refusalCode(err) === 'unknown-report') return null;
    throw err;
  }
}

export const RATIONALE_MAX = 4000;

export interface DimensionCorrection {
  score: number;
  rationale: string;
}

export function correctDimension(
  reportId: string,
  dimensionN: number,
  correction: DimensionCorrection,
): Promise<{ base: number; score: number; status: string }> {
  return coachRequest<{ base: number; score: number; status: string }>(adminReportPath(reportId, `dimensions/${dimensionN}`), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(correction),
  });
}

export function amendReport(reportId: string, amendment: ReportAmendment): Promise<RevisionResult> {
  return coachRequest<RevisionResult>(adminReportPath(reportId, 'amend'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(amendment),
  });
}

export function setFirstLesson(
  reportId: string,
  input: { firstLesson: boolean; score?: number; rationale?: string },
): Promise<RevisionResult> {
  return coachRequest<RevisionResult>(adminReportPath(reportId, 'first-lesson'), {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export interface ImprovementsEdit {
  improvements: string[];
  improvementsProse?: CoachFeedbackPoint[];
}

export function editImprovements(reportId: string, edit: ImprovementsEdit): Promise<RevisionResult> {
  return coachRequest<RevisionResult>(adminReportPath(reportId, 'improvements'), {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(edit),
  });
}

export async function fetchReportRevisions(reportId: string): Promise<ReportVersion[]> {
  const data = await coachRequest<{ revisions: ReportVersion[] }>(adminReportPath(reportId, 'revisions'));
  return data.revisions || [];
}

export function sendRevision(reportId: string): Promise<RevisionSendResult> {
  return coachRequest<RevisionSendResult>(adminReportPath(reportId, 'revision/send'), { method: 'POST' });
}

export function requeueRevision(reportId: string): Promise<{ requeued: boolean }> {
  return coachRequest<{ requeued: boolean }>(adminReportPath(reportId, 'revision/requeue'), { method: 'POST' });
}

export interface ComparedSession {
  coachId: string;
  date: string;
  backend: { sourceSessionId: string; reportId: string; composite: number };
  host: { reportId: string; composite: number | null };
  compositeDifference: number | null;
  dimensions: { n: number; host: number | null; backend: number | null; difference: number | null }[];
  withinOne: number;
  comparable: number;
  flagged: boolean;
}

export interface ParallelRunComparison {
  sessions: ComparedSession[];
  needsPairing: {
    coachId: string;
    date: string;
    backend: { sourceSessionId: string; reportId: string }[];
    host: { reportId: string }[];
  }[];
  unmatched: {
    backend: { coachId: string; date: string; sourceSessionId: string; reportId: string }[];
    host: { coachId: string; date: string; reportId: string }[];
  };
  share: { withinOne: number; comparable: number; ratio: number | null };
  counts: { compared: number; flagged: number; needsPairing: number; unmatchedBackend: number; unmatchedHost: number };
}

export function fetchParallelRunComparison(): Promise<ParallelRunComparison> {
  return coachRequest<ParallelRunComparison>('admin/parallel-run/comparison');
}

export interface CoverageLeader {
  coachId: string;
  name: string;
  email: string;
  covered: boolean;
  basis: 'observed' | 'attested-not-teaching' | 'attestation-lapsed' | 'no-observation';
  observedSessions: number;
  accountStatus: string;
  linkedClassName: string | null;
  classAlert: boolean;
  attestedAt: string | null;
  attestedBy: string | null;
}

export interface CoverageReport {
  windowDays: number;
  allCovered: boolean;
  leaders: CoverageLeader[];
}

export function fetchCoverage(windowDays = 30): Promise<CoverageReport> {
  return coachRequest<CoverageReport>(`admin/coverage?windowDays=${windowDays}`);
}

export function setNotTeaching(coachId: string, attested: boolean): Promise<{ attested: boolean }> {
  return coachRequest<{ attested: boolean }>(`admin/leaders/${encodeURIComponent(coachId)}/not-teaching`, {
    method: attested ? 'POST' : 'DELETE',
  });
}

/** GET /api/coach/trends, derived score / cluster / dimension series. */
export function fetchCoachTrends(): Promise<CoachTrends> {
  return coachRequest<CoachTrends>('trends');
}

// ─── Admin oversight (program admins only) ─────────────────────────────────

/** GET /coach/admin/coaches, every leader's roster summary. 403 for
 *  non-admins → surfaces as CoachAuthError('not_a_coach'). */
export async function fetchAdminCoaches(): Promise<CoachSummary[]> {
  const data = await coachRequest<{ coaches: CoachSummary[] }>('admin/coaches');
  return data.coaches || [];
}

/** GET /coach/admin/coaches/:id/trends, a specific leader's trends. */
export function fetchCoachTrendsFor(coachId: string): Promise<CoachTrends> {
  return coachRequest<CoachTrends>(`admin/coaches/${encodeURIComponent(coachId)}/trends`);
}

/** PUT /api/coach/zoom-link, persist the coach's meeting link. */
export async function saveCoachZoomLink(zoomLink: string): Promise<string> {
  const data = await coachRequest<{ zoomLink: string }>('zoom-link', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ zoomLink }),
  });
  return data.zoomLink;
}

// ─── Classes (Class Setup) ──────────────────────────────────────────────────

/** GET /api/coach/classes, this coach's registered classes, newest-edited
 *  first. */
export async function fetchCoachClasses(): Promise<CoachClass[]> {
  const data = await coachRequest<{ classes: CoachClass[] }>('classes');
  return data.classes || [];
}

/** POST /api/coach/classes, register a new class. */
export async function createCoachClass(input: CoachClassInput): Promise<CoachClass> {
  const data = await coachRequest<{ class: CoachClass }>('classes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.class;
}

/** PUT /api/coach/classes/:id, update an existing class. */
export async function updateCoachClass(id: string, input: CoachClassInput): Promise<CoachClass> {
  const data = await coachRequest<{ class: CoachClass }>(`classes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data.class;
}

/** DELETE /api/coach/classes/:id, remove a class. */
export async function deleteCoachClass(id: string): Promise<void> {
  await coachRequest<{ success: boolean }>(`classes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/** GET /coach/admin/classes, every leader's classes with owner identity
 *  (admin only; 403 for non-admins). The single feed the Fireflies bot's
 *  auto-joins are configured from. */
export async function fetchAllCoachClasses(): Promise<AdminCoachClass[]> {
  const data = await coachRequest<{ classes: AdminCoachClass[] }>('admin/classes');
  return data.classes || [];
}

/** PUT /api/coach/affiliated-church, persist the coach's affiliated church. */
export async function saveCoachAffiliatedChurch(affiliatedChurch: string): Promise<string> {
  const data = await coachRequest<{ affiliatedChurch: string }>('affiliated-church', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ affiliatedChurch }),
  });
  return data.affiliatedChurch;
}

/** PUT /api/coach/bible-coach, persist the coach's selected Bible coach. */
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

/** POST /coach/admin/leaders, add a leader by email (+ optional name/group).
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

export interface LeaderEmailRequest {
  email: string;
  status: 'pending' | 'unchanged';
  expiresAt: string | null;
  confirmationSent: boolean;
}

export function updateLeaderEmail(coachId: string, email: string, confirm = false): Promise<LeaderEmailRequest> {
  return coachRequest<LeaderEmailRequest>(`admin/leaders/${encodeURIComponent(coachId)}/email`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(confirm ? { email, confirm: true } : { email }),
  });
}

export type AddressChangeDescription =
  | { leaderName: string; newEmail: string; state: 'pending'; expiresAt: string }
  | { state: 'expired' | 'confirmed' | 'superseded' | 'refused'; expiresAt: string };

export function describeAddressChange(token: string): Promise<AddressChangeDescription> {
  return coachRequest<AddressChangeDescription>('confirm-address/describe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export function confirmAddressChange(token: string): Promise<{ email: string; noticeSent: boolean }> {
  return coachRequest<{ email: string; noticeSent: boolean }>('confirm-address', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export function needsBenchmarkConfirm(err: unknown): boolean {
  return err instanceof CoachApiError && err.status === 409 && err.details.refusal === 'confirm-required';
}

export interface LeaderAttribution {
  titleMatch: string[];
  altEmails: string[];
}

export function fetchLeaderAttribution(coachId: string): Promise<LeaderAttribution> {
  return coachRequest<LeaderAttribution>(`admin/leaders/${encodeURIComponent(coachId)}/attribution`);
}

export function saveLeaderAttribution(
  coachId: string,
  attribution: LeaderAttribution,
): Promise<LeaderAttribution & { resolved: number }> {
  return coachRequest<LeaderAttribution & { resolved: number }>(`admin/leaders/${encodeURIComponent(coachId)}/attribution`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(attribution),
  });
}

export function isPlaceholderAddress(email: string): boolean {
  return email.trim().toLowerCase().replace(/\.+$/, '').endsWith('.invalid');
}

export const EMAIL_RULE =
  'Enter one email address: letters, digits and . _ % + - before the @, then a domain such as example.org, with no trailing dot';

const EMAIL_LOCAL = /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]+(?<!\.)$/;
const EMAIL_DOMAIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

export function isEmailAddress(value: string): boolean {
  if (value.length > 254) return false;
  const at = value.lastIndexOf('@');
  if (at <= 0) return false;
  return EMAIL_LOCAL.test(value.slice(0, at)) && EMAIL_DOMAIN.test(value.slice(at + 1));
}

export function badAddressText(value: string): string | null {
  const v = value.trim().toLowerCase();
  return v && !isEmailAddress(v) ? EMAIL_RULE : null;
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

/** POST a coaching note on a session, persisted + emailed to the leader. */
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

/** Program-wide monthly narrative, the same prose the monthly PDF carries. */
export interface MonthlyNarrative {
  executiveSummary: string[];
  trends: string[];
}

/** GET /coach/admin/monthly?month=YYYY-MM, program-wide + per-leader rollup. */
export function fetchAdminMonthly(month: string): Promise<CoachMonthly> {
  return coachRequest<CoachMonthly>(`admin/monthly?month=${encodeURIComponent(month)}`);
}

// ─── Per-leader monthly summary (full parity with the individual monthly PDF)

export interface LeaderMonthlyClusterAvg {
  tc: number | null;
  bm: number | null;
  ep: number | null;
  br: number | null;
}
export interface LeaderMonthlyGlanceRow {
  date: string;
  session: string;
  bm: number | null;
  tc: number | null;
  ep: number | null;
  br: number | null;
  composite: number;
  status: string;
}
export interface LeaderMonthlyCluster {
  key: string;
  name: string;
  weight: number;
  avgPct: number | null;
  statusLabel: string;
  strongestDim: { name: string; val: number } | null;
  weakestDim: { name: string; val: number } | null;
  insight: string;
}
export interface LeaderMonthlySessionDetail {
  date: string;
  session: string;
  composite: number;
  status: string;
  dimensions: { n: number; name: string; cluster: string; score: number | null; note: string }[];
}
export interface LeaderMonthlySummary {
  month: string;
  monthLabel: string;
  priorMonthLabel: string;
  leaderId: string;
  leaderName: string;
  group: string;
  sessionsCount: number;
  composite: number;
  status: { label: string; emoji: string };
  priorComposite: number | null;
  delta: number | null;
  clusterAvg: LeaderMonthlyClusterAvg;
  glance: {
    rows: LeaderMonthlyGlanceRow[];
    avg: { bm: number | null; tc: number | null; ep: number | null; br: number | null; composite: number; status: string };
  };
  trajectory: { date: string; session: string; composite: number; status: string; delta: number | null }[];
  clusters: LeaderMonthlyCluster[];
  strengths: { text: string; session: string }[];
  growth: { text: string; session: string }[];
  trends: string[];
  conversationGuide: { label: string; q: string }[];
  focus: { clusterName: string; clusterPct: number | null; goals: string[] };
  sessions: LeaderMonthlySessionDetail[];
}

export interface LeaderMonthlyResponse {
  profile: { id: string; name: string; group: string };
  summary: LeaderMonthlySummary | null;
  /** Months this leader has a summary for, newest first. */
  availableMonths: string[];
}

/** GET /coach/monthly-summary?month=YYYY-MM, the signed-in leader's own. */
export function fetchMyMonthlySummary(month: string): Promise<LeaderMonthlyResponse> {
  return coachRequest<LeaderMonthlyResponse>(`monthly-summary?month=${encodeURIComponent(month)}`);
}

/** GET /coach/admin/coaches/:id/monthly-summary?month=YYYY-MM, admin drill-in. */
export function fetchLeaderMonthlySummary(
  coachId: string,
  month: string,
): Promise<LeaderMonthlyResponse> {
  return coachRequest<LeaderMonthlyResponse>(
    `admin/coaches/${encodeURIComponent(coachId)}/monthly-summary?month=${encodeURIComponent(month)}`,
  );
}

// ─── Small view helpers (shared across the coach screens) ──────────────────

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Brand-aligned colour for a status label, highest band first.
 *
 * Keyed by the band's POSITION in the served order, not by its label. The
 * switch this replaces named all five labels, which made it a copy of the
 * rubric: renaming a band dropped its colour to the red default, so a leader
 * in the TOP band would have been shown the colour of the bottom one.
 */
const STATUS_PALETTE = [
  'var(--vm-dust)', // brand gold, top band
  '#15803D',
  '#B08900',
  '#C2620F',
  '#B91C1C',
];

/**
 * Neutral, for a status this function cannot place in the served order.
 *
 * Falling back to the palette's last entry was wrong twice over. The bands
 * arrive asynchronously, so on first paint every caller passed `[]` and every
 * status, including the top one, rendered in the bottom band's red. And an
 * unrecognised label is unknown, not bad: colouring it red asserts something
 * about the leader's session that nothing in the data supports.
 */
const STATUS_UNKNOWN = '#8A8272';

export function statusColor(
  status: string,
  bandLabels: string[] = [],
): string {
  return spreadOver(bandLabels.indexOf(status), bandLabels.length, STATUS_PALETTE) ?? STATUS_UNKNOWN;
}

