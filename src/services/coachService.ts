import type {
  GetCoachAdminClassesResponse,
  GetCoachAdminCoachesResponse,
  GetCoachAdminCoverageResponse,
  GetCoachAdminDuplicatesResponse,
  GetCoachAdminLeadersByIdAttributionResponse,
  GetCoachAdminMonthlyResponse,
  GetCoachAdminNotetakerZoomResponse,
  GetCoachAdminParallelRunComparisonResponse,
  GetCoachAdminPipelineFailuresResponse,
  GetCoachAdminReportsByReportIdReviewResponse,
  GetCoachAdminResharesResponse,
  GetCoachAdminRotatingClassesResponse,
  GetCoachClassesResponse,
  GetCoachMeResponse,
  GetCoachMonthlySummaryResponse,
  GetCoachNotetakerStatusResponse,
  GetCoachReportsByReportIdResponse,
  GetCoachTrendsResponse,
  GetCoachUploadsClassesResponse,
  GetCoachUploadsResponse,
  PostCoachAdminCoachesByIdReportsByReportIdNotesResponse,
  PostCoachAdminReportsByReportIdAmendResponse,
  PostCoachAdminReportsByReportIdReleaseResponse,
  PostCoachAdminReportsByReportIdRevisionSendResponse,
  PostCoachAdminRotatingClassesData,
  PostCoachAdminUploadsData,
  PostCoachClassesData,
  PostCoachConfirmAddressDescribeResponse,
  PostCoachUploadsData,
  PostCoachUploadsResponse,
  PutCoachAdminLeadersByIdEmailResponse,
  GetCoachAdminReportsByReportIdRevisionsResponse,
  GetCoachReportsSummaryResponse,
  PostCoachAdminReportsByReportIdAmendData,
  PutCoachAdminMonthlyReportsByIdData,
} from '@/api/generated/types.gen';
import { newQuietClient } from '@/api/client';
import {
  deleteCoachAdminClassesById,
  deleteCoachAdminLeadersByIdNotTeaching,
  deleteCoachClassesById,
  getCoachAdminClasses,
  getCoachAdminCoaches,
  getCoachAdminCoachesByIdMonthlySummary,
  getCoachAdminCoachesByIdReportsByReportId,
  getCoachAdminCoachesByIdReportsSummary,
  getCoachAdminCoachesByIdTrends,
  getCoachAdminCoverage,
  getCoachAdminDuplicates,
  getCoachAdminLeadersByIdAttribution,
  getCoachAdminMonthly,
  getCoachAdminMonthlyReports,
  getCoachAdminNotetakerZoom,
  getCoachAdminParallelRunComparison,
  getCoachAdminPipelineFailures,
  getCoachAdminReportsByReportIdReview,
  getCoachAdminReportsByReportIdRevisions,
  getCoachAdminReshares,
  getCoachAdminRotatingClasses,
  getCoachAdminUploads,
  getCoachAdminUploadsClasses,
  getCoachClasses,
  getCoachMe,
  getCoachMonthlySummary,
  getCoachNotetakerStatus,
  getCoachReportsByReportId,
  getCoachReportsByReportIdRecordingUrl,
  getCoachReportsSummary,
  getCoachTrends,
  getCoachUploads,
  getCoachUploadsClasses,
  postCoachAdminClasses,
  postCoachAdminCoachesByIdReportsByReportIdNotes,
  postCoachAdminDuplicatesBySourceSessionIdDismiss,
  postCoachAdminDuplicatesBySourceSessionIdScore,
  postCoachAdminLeaders,
  postCoachAdminLeadersByIdNotTeaching,
  postCoachAdminMonthlyReportsByIdRelease,
  postCoachAdminPipelineFailuresBySourceSessionIdRequeue,
  postCoachAdminReportsByReportIdAmend,
  postCoachAdminReportsByReportIdDimensionsByDimensionN,
  postCoachAdminReportsByReportIdRelease,
  postCoachAdminReportsByReportIdRevisionRequeue,
  postCoachAdminReportsByReportIdRevisionSend,
  postCoachAdminResharesBySourceSessionIdResolve,
  postCoachAdminResharesBySourceSessionIdSend,
  postCoachAdminRotatingClasses,
  postCoachAdminSessionsBySourceSessionIdAttribute,
  postCoachAdminUploads,
  postCoachAdminUploadsByIdComplete,
  postCoachAdminUploadsByIdParts,
  postCoachClasses,
  postCoachConfirmAddress,
  postCoachConfirmAddressDescribe,
  postCoachUploads,
  postCoachUploadsByIdComplete,
  postCoachUploadsByIdParts,
  putCoachAdminClassesById,
  putCoachAdminCoachesByIdReportsByReportIdRecording,
  putCoachAdminLeadersByIdAttribution,
  putCoachAdminLeadersByIdEmail,
  putCoachAdminLeadersByIdRotatingOnly,
  putCoachAdminMonthlyReportsById,
  putCoachAdminReportsByReportIdFirstLesson,
  putCoachAdminReportsByReportIdImprovements,
  putCoachAdminRotatingClassesById,
  putCoachAffiliatedChurch,
  putCoachBibleCoach,
  putCoachClassesById,
  putCoachZoomLink,
} from '@/api/generated/sdk.gen';
import { spreadOver } from './rubric';
import type { MonthlyReportRow } from './coachMonthlyEdit';
import { scrubCoachPath, stripQuery } from '@/lib/analyticsPrivacy';

// ─── Domain types ──────────────────────────────────────────────────────────

export type CoachCluster = CoachReport['clusters'][number];

export type CoachDimension = CoachReport['dimensions'][number];

export type CoachReport = GetCoachReportsByReportIdResponse['report'];

/** A coaching note on a session, written by an admin, emailed to the leader. */
export type CoachNote = PostCoachAdminCoachesByIdReportsByReportIdNotesResponse['note'];

/** One timestamped moment within a report section (e.g. a key moment or a
 *  point on the session-flow timeline). */
export type CoachMoment = NonNullable<CoachReportSection['moments']>[number];

/** A free-form report section from the pipeline. Any combination of prose
 *  paragraphs, bullet points, and timestamped moments, whatever the section
 *  needs, so new PDF sections surface on the portal without a schema change. */
export type CoachReportSection = NonNullable<CoachReport['sections']>[number];

/** One fully-written coaching point: a short title plus prose paragraphs.
 *  Emitted directly by the Bible-Coach pipeline (no Google Docs hop) so the
 *  portal can render the complete narrative on-page. */
export type CoachFeedbackPoint = NonNullable<CoachFeedback['strengthsProse']>[number];

export type CoachFeedback = CoachReport['feedback'];

export type CoachProfile = NonNullable<CoachMe['profile']>;

export type { StatusBand } from './rubric';

/** Allowed recurrence keywords for a class (mirrors the backend DTO). */
export type CoachClassRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

/** One registered class. The VerseMate notetaker joins its `zoomLink` on
 *  `classDate` at `startTime` in `timeZone`, then on every repeat; a leader can
 *  register several. */
export type CoachClass = GetCoachClassesResponse['classes'][number];

/** Fields a caller sends when creating / updating a class. `classDate` is an
 *  ISO yyyy-mm-dd string or '' (no pinned date). The server refuses a start
 *  time without a zone. Left out, the optional fields save as empty with the
 *  notetaker on, not as they were, so an edit sends them back. */
export type CoachClassInput = PostCoachClassesData['body'];

/** One class in the admin all-leaders export, the class plus the leader it
 *  belongs to, so admins can see every class the notetaker records across the
 *  cohort. */
export type AdminCoachClass = GetCoachAdminClassesResponse['classes'][number];

/** Whether the signed-in leader connected their Zoom account to the
 *  notetaker. `known` false: the notetaker did not answer, so `connected`
 *  says nothing either way. */
export type NotetakerStatus = GetCoachNotetakerStatusResponse;

/** A roster leader a connected Zoom account or meeting was matched to. */
export type NotetakerLeaderRef = { id: string; name: string } | null;

/** A scheduled meeting of a connected Zoom account, in Class Setup's terms. */
export type NotetakerZoomMeeting = NotetakerZoom['meetings'][number];

/** The admin's view of the notetaker. `available` false: it did not answer. */
export type NotetakerZoom = GetCoachAdminNotetakerZoomResponse;

export type CoachMe = GetCoachMeResponse;

/** An address change an admin asked for that has not taken effect. */
export type AddressChange = NonNullable<CoachSummary['addressChange']>;

/** One row in the admin oversight roster. */
export type CoachSummary = GetCoachAdminCoachesResponse['coaches'][number];

/** Row shape for the cluster + dimension trend charts: a date plus one
 *  numeric key per cluster / dimension name. */
export type TrendRow = CoachTrends['clusterSeries'][number];

export type CoachTrends = GetCoachTrendsResponse;

// ─── Errors ────────────────────────────────────────────────────────────────

export type CoachAuthReason = 'signed_out' | 'not_a_coach' | 'confirm_email';

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
    super(`coach api ${scrubCoachPath(`/coach/${stripQuery(path)}`)} failed: ${status}`);
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

export function newCoachClient() {
  const client = newQuietClient();
  client.setConfig({ parseAs: 'json' });
  client.interceptors.response.use(namingInvalidJson);
  return client;
}

const coachClient = newCoachClient();

function coachRoute(request: Request): string {
  const { pathname } = new URL(request.url);
  const at = pathname.indexOf('/coach/');
  return at === -1 ? pathname : pathname.slice(at + '/coach/'.length);
}

function namingInvalidJson(response: Response, request: Request): Response {
  const parse = response.json.bind(response);
  response.json = () =>
    parse().catch((error: unknown) => {
      if (!(error instanceof SyntaxError)) throw error;
      throw new SyntaxError(`coach api ${scrubCoachPath(`/coach/${coachRoute(request)}`)} returned invalid JSON`);
    });
  return response;
}

type CoachErrorBody = { message?: unknown; details?: Record<string, unknown> };

function errorBodyOf(error: unknown): CoachErrorBody {
  return error && typeof error === 'object' ? (error as CoachErrorBody) : {};
}

export type ForbiddenMode = 'gate' | 'refusal';

export async function coachCall<T>(
  pending: Promise<{ data?: T; error?: unknown; request: Request; response: Response }>,
  forbidden: ForbiddenMode = 'gate',
): Promise<T> {
  const { data, error, request, response } = await pending.catch((failure: unknown) => {
    if (failure instanceof SyntaxError) throw new Error(failure.message);
    throw failure;
  });
  if (response.status === 401) throw new CoachAuthError('signed_out');
  const body = errorBodyOf(error);
  if (response.status === 403 && forbidden === 'gate') {
    throw new CoachAuthError(body.details?.refusal === 'confirm-email' ? 'confirm_email' : 'not_a_coach');
  }
  if (!response.ok || data === undefined) {
    const message = typeof body.message === 'string' ? body.message : '';
    throw new CoachApiError(coachRoute(request), response.status, message, body.details ?? {});
  }
  return data;
}

/** GET /api/coach/me, profile + saved Zoom link + model metadata. */
export function fetchCoachMe(): Promise<CoachMe> {
  return coachCall(getCoachMe({ client: coachClient }));
}

export type CoachReportSummary = GetCoachReportsSummaryResponse['items'][number];

export interface CoachReportSummaryPage {
  items: CoachReportSummary[];
  total: number;
  streakWeeks: number;
  quarterSessions: number;
}

export const REPORT_PAGE_SIZE = 50;

export function scoreDelta(current: number | undefined, previous: number | undefined): number | null {
  return current === undefined || previous === undefined ? null : Math.round((current - previous) * 100) / 100;
}

export async function fetchCoachReportSummaries(
  offset = 0,
  limit = REPORT_PAGE_SIZE,
  coachId?: string,
): Promise<CoachReportSummaryPage> {
  const query = { limit, offset };
  return coachCall(
    coachId
      ? getCoachAdminCoachesByIdReportsSummary({ client: coachClient, path: { id: coachId }, query })
      : getCoachReportsSummary({ client: coachClient, query }),
  );
}

export async function fetchCoachReportDetail(
  reportId: string,
  coachId?: string,
): Promise<CoachReport | null> {
  try {
    const data = await coachCall(
      coachId
        ? getCoachAdminCoachesByIdReportsByReportId({ client: coachClient, path: { id: coachId, reportId } })
        : getCoachReportsByReportId({ client: coachClient, path: { reportId } }),
    );
    return data.report;
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
  return coachCall(getCoachReportsByReportIdRecordingUrl({ client: coachClient, path: { reportId } })).catch(() => null);
}

/** A session whose recording could not be retrieved (tasks 4.9a, 8.5a). */
export type PendingReshare = GetCoachAdminResharesResponse['requests'][number];

/** GET /api/coach/admin/reshares, admin only. */
export async function fetchPendingReshares(): Promise<PendingReshare[]> {
  return (await coachCall(getCoachAdminReshares({ client: coachClient }))).requests;
}

/** POST /api/coach/admin/reshares/:id/send, asks the leader to re-share. */
export function sendReshareRequest(sourceSessionId: string): Promise<{ sent: boolean }> {
  return coachCall(postCoachAdminResharesBySourceSessionIdSend({ client: coachClient, path: { sourceSessionId } }));
}

/**
 * POST /api/coach/admin/reshares/:id/resolve, the session re-enters
 * retrieval. Intake idempotence means the report it eventually produces is not
 * a duplicate.
 */
export function resolveReshareRequest(
  sourceSessionId: string,
): Promise<{ resolved: boolean }> {
  return coachCall(postCoachAdminResharesBySourceSessionIdResolve({ client: coachClient, path: { sourceSessionId } }));
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

export type PipelineFailure = PipelineFailurePage['sessions'][number];

export type PipelineFailurePage = GetCoachAdminPipelineFailuresResponse;

export const PIPELINE_PAGE_SIZE = 50;

export function fetchPipelineFailures(offset = 0, limit = PIPELINE_PAGE_SIZE): Promise<PipelineFailurePage> {
  return coachCall(getCoachAdminPipelineFailures({ client: coachClient, query: { limit, offset } }));
}

export function requeuePipelineFailure(sourceSessionId: string): Promise<{ requeued: boolean }> {
  return coachCall(postCoachAdminPipelineFailuresBySourceSessionIdRequeue({ client: coachClient, path: { sourceSessionId } }));
}

export function attributeSession(
  sourceSessionId: string,
  coachId: string,
  expectedCoachId: string | null,
): Promise<{ coachId: string; state: string }> {
  return coachCall(
    postCoachAdminSessionsBySourceSessionIdAttribute({ client: coachClient, path: { sourceSessionId }, body: { coachId, expectedCoachId } }),
  );
}

export type ReleaseOutcome = PostCoachAdminReportsByReportIdReleaseResponse;

export function releaseHeldReport(reportId: string): Promise<ReleaseOutcome> {
  return coachCall(postCoachAdminReportsByReportIdRelease({ client: coachClient, path: { reportId } }));
}

export type ReportReviewState = GetCoachAdminReportsByReportIdReviewResponse;

/** One dimension under review. Each of what produced it is null when it was not recorded. */
export type ReviewDimension = ReportReviewState['dimensions'][number];

export const AMENDABLE_BODY_FIELDS = ['headline', 'overview', 'strengths', 'improvements', 'recommendations'] as const;
export type AmendableBodyField = (typeof AMENDABLE_BODY_FIELDS)[number];
export const PROSE_LISTS = ['strengths', 'improvements', 'recommendations'] as const;
export type ProseList = (typeof PROSE_LISTS)[number];
export type ProseField = `${ProseList}Prose`;

export type ScorecardRating = 'STRONG' | 'ON TARGET' | 'NEEDS WORK' | 'N/A';

export const SCORECARD_RATINGS: ScorecardRating[] = ['STRONG', 'ON TARGET', 'NEEDS WORK', 'N/A'];

export interface BigIdeasReviewRow {
  value: string;
  rating: ScorecardRating;
}

export type ReportAmendment = PostCoachAdminReportsByReportIdAmendData['body'];

export type RevisionSends = Pick<RevisionResult, 'sends' | 'skipped'>;

export type RevisionResult = PostCoachAdminReportsByReportIdAmendResponse;

export type RevisionSendResult = PostCoachAdminReportsByReportIdRevisionSendResponse;

export type ReportVersion = GetCoachAdminReportsByReportIdRevisionsResponse['revisions'][number];
export type ReportRevision = Extract<ReportVersion, { kind: 'revision' }>;
export type ReportEdit = Extract<ReportVersion, { kind: 'edit' }>;
export type ReportRevisionChanges = ReportRevision['changes'];

export async function fetchReportReview(reportId: string): Promise<ReportReviewState | null> {
  try {
    return await coachCall(getCoachAdminReportsByReportIdReview({ client: coachClient, path: { reportId } }));
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
  return coachCall(
    postCoachAdminReportsByReportIdDimensionsByDimensionN({ client: coachClient, path: { reportId, dimensionN: String(dimensionN) }, body: correction }),
  );
}

export function amendReport(reportId: string, amendment: ReportAmendment): Promise<RevisionResult> {
  return coachCall(postCoachAdminReportsByReportIdAmend({ client: coachClient, path: { reportId }, body: amendment }));
}

export function setFirstLesson(
  reportId: string,
  input: { firstLesson: boolean; score?: number; rationale?: string; bigIdeasReview?: BigIdeasReviewRow },
): Promise<RevisionResult> {
  return coachCall(putCoachAdminReportsByReportIdFirstLesson({ client: coachClient, path: { reportId }, body: input }));
}

export interface ImprovementsEdit {
  improvements: string[];
  improvementsProse?: CoachFeedbackPoint[];
}

export function editImprovements(reportId: string, edit: ImprovementsEdit): Promise<RevisionResult> {
  return coachCall(putCoachAdminReportsByReportIdImprovements({ client: coachClient, path: { reportId }, body: edit }));
}

export async function fetchReportRevisions(reportId: string): Promise<ReportVersion[]> {
  return (await coachCall(getCoachAdminReportsByReportIdRevisions({ client: coachClient, path: { reportId } }))).revisions;
}

export function sendRevision(reportId: string): Promise<RevisionSendResult> {
  return coachCall(postCoachAdminReportsByReportIdRevisionSend({ client: coachClient, path: { reportId } }));
}

export function requeueRevision(reportId: string): Promise<{ requeued: boolean }> {
  return coachCall(postCoachAdminReportsByReportIdRevisionRequeue({ client: coachClient, path: { reportId } }));
}

export type ComparedSession = ParallelRunComparison['sessions'][number];

export type ParallelRunComparison = GetCoachAdminParallelRunComparisonResponse;

export function fetchParallelRunComparison(): Promise<ParallelRunComparison> {
  return coachCall(getCoachAdminParallelRunComparison({ client: coachClient }));
}

export type CoverageLeader = CoverageReport['leaders'][number];

export type CoverageReport = GetCoachAdminCoverageResponse;

export function fetchCoverage(windowDays = 30): Promise<CoverageReport> {
  return coachCall(getCoachAdminCoverage({ client: coachClient, query: { windowDays } }));
}

export function setNotTeaching(coachId: string, attested: boolean): Promise<{ attested: boolean }> {
  const options = { client: coachClient, path: { id: coachId } };
  return coachCall(
    attested ? postCoachAdminLeadersByIdNotTeaching(options) : deleteCoachAdminLeadersByIdNotTeaching(options),
  );
}

/** GET /api/coach/trends, derived score / cluster / dimension series. */
export function fetchCoachTrends(): Promise<CoachTrends> {
  return coachCall(getCoachTrends({ client: coachClient }));
}

// ─── Admin oversight (program admins only) ─────────────────────────────────

/** GET /coach/admin/coaches, every leader's roster summary. 403 for
 *  non-admins → surfaces as CoachAuthError('not_a_coach'). */
export async function fetchAdminCoaches(): Promise<CoachSummary[]> {
  return (await coachCall(getCoachAdminCoaches({ client: coachClient }))).coaches;
}

/** GET /coach/admin/coaches/:id/trends, a specific leader's trends. */
export function fetchCoachTrendsFor(coachId: string): Promise<CoachTrends> {
  return coachCall(getCoachAdminCoachesByIdTrends({ client: coachClient, path: { id: coachId } }));
}

/** PUT /api/coach/zoom-link, persist the coach's meeting link. */
export async function saveCoachZoomLink(zoomLink: string): Promise<string> {
  return (await coachCall(putCoachZoomLink({ client: coachClient, body: { zoomLink } }))).zoomLink;
}

// ─── Classes (Class Setup) ──────────────────────────────────────────────────

/** GET /api/coach/classes, this coach's registered classes, newest-edited
 *  first. */
export async function fetchCoachClasses(): Promise<CoachClass[]> {
  return (await coachCall(getCoachClasses({ client: coachClient }))).classes;
}

/** POST /api/coach/classes, register a new class. */
export async function createCoachClass(input: CoachClassInput): Promise<CoachClass> {
  return (await coachCall(postCoachClasses({ client: coachClient, body: input }))).class;
}

/** PUT /api/coach/classes/:id, update an existing class. */
export async function updateCoachClass(id: string, input: CoachClassInput): Promise<CoachClass> {
  return (await coachCall(putCoachClassesById({ client: coachClient, path: { id }, body: input }))).class;
}

/** DELETE /api/coach/classes/:id, remove a class. */
export async function deleteCoachClass(id: string): Promise<void> {
  await coachCall(deleteCoachClassesById({ client: coachClient, path: { id } }));
}

/** GET /api/coach/notetaker/status, whether this leader's Zoom account is
 *  connected to the notetaker. */
export function fetchNotetakerStatus(): Promise<NotetakerStatus> {
  return coachCall(getCoachNotetakerStatus({ client: coachClient }));
}

/** GET /coach/admin/classes, every leader's classes with owner identity
 *  (admin only; 403 for non-admins). */
export async function fetchAllCoachClasses(): Promise<AdminCoachClass[]> {
  return (await coachCall(getCoachAdminClasses({ client: coachClient }))).classes;
}

/** POST /coach/admin/classes, an admin schedules a class for the roster
 *  leader `coachId`, also one who has not signed up yet. A leader the roster
 *  does not know is refused with `unknown-leader`. */
export async function createAdminCoachClass(coachId: string, input: CoachClassInput): Promise<AdminCoachClass> {
  return (await coachCall(postCoachAdminClasses({ client: coachClient, body: { ...input, coachId } }))).class;
}

/** PUT /coach/admin/classes/:id, an admin edits any leader's class. */
export async function updateAdminCoachClass(id: string, input: CoachClassInput): Promise<CoachClass> {
  return (await coachCall(putCoachAdminClassesById({ client: coachClient, path: { id }, body: input }))).class;
}

/** DELETE /coach/admin/classes/:id, an admin removes any leader's class. */
export async function deleteAdminCoachClass(id: string): Promise<void> {
  await coachCall(deleteCoachAdminClassesById({ client: coachClient, path: { id } }));
}

/** GET /coach/admin/notetaker/zoom, the connected Zoom accounts and their
 *  scheduled meetings, so an admin can pick the ones to record. */
export async function fetchNotetakerZoom(): Promise<NotetakerZoom> {
  const data = await coachCall(getCoachAdminNotetakerZoom({ client: coachClient }));
  return { ...data, connections: data.connections ?? [], meetings: data.meetings ?? [] };
}

/** PUT /api/coach/affiliated-church, persist the coach's affiliated church. */
export async function saveCoachAffiliatedChurch(affiliatedChurch: string): Promise<string> {
  return (await coachCall(putCoachAffiliatedChurch({ client: coachClient, body: { affiliatedChurch } }))).affiliatedChurch;
}

/** PUT /api/coach/bible-coach, persist the coach's selected Bible coach. */
export async function saveCoachBibleCoach(bibleCoach: string): Promise<string> {
  return (await coachCall(putCoachBibleCoach({ client: coachClient, body: { bibleCoach } }))).bibleCoach;
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
  return (await coachCall(postCoachAdminLeaders({ client: coachClient, body: input }))).coach;
}

export type LeaderEmailRequest = PutCoachAdminLeadersByIdEmailResponse;

export function updateLeaderEmail(coachId: string, email: string, confirm = false): Promise<LeaderEmailRequest> {
  return coachCall(
    putCoachAdminLeadersByIdEmail({ client: coachClient, path: { id: coachId }, body: confirm ? { email, confirm: true } : { email } }),
  );
}

export type AddressChangeDescription = PostCoachConfirmAddressDescribeResponse;

export function describeAddressChange(token: string): Promise<AddressChangeDescription> {
  return coachCall(postCoachConfirmAddressDescribe({ client: coachClient, body: { token } }));
}

export function confirmAddressChange(token: string): Promise<{ email: string; noticeSent: boolean }> {
  return coachCall(postCoachConfirmAddress({ client: coachClient, body: { token } }));
}

export function needsBenchmarkConfirm(err: unknown): boolean {
  return err instanceof CoachApiError && err.status === 409 && err.details.refusal === 'confirm-required';
}

export type LeaderAttribution = GetCoachAdminLeadersByIdAttributionResponse;

export function fetchLeaderAttribution(coachId: string): Promise<LeaderAttribution> {
  return coachCall(getCoachAdminLeadersByIdAttribution({ client: coachClient, path: { id: coachId } }));
}

export function saveLeaderAttribution(
  coachId: string,
  attribution: LeaderAttribution,
): Promise<LeaderAttribution & { resolved: number }> {
  return coachCall(putCoachAdminLeadersByIdAttribution({ client: coachClient, path: { id: coachId }, body: attribution }));
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
  const data = await coachCall(
    putCoachAdminCoachesByIdReportsByReportIdRecording({ client: coachClient, path: { id: coachId, reportId }, body: { recordingUrl } }),
  );
  return data.recordingUrl;
}

/** POST a coaching note on a session, persisted + emailed to the leader. */
export async function addCoachNote(
  coachId: string,
  reportId: string,
  body: string,
): Promise<CoachNote> {
  const data = await coachCall(
    postCoachAdminCoachesByIdReportsByReportIdNotes({ client: coachClient, path: { id: coachId, reportId }, body: { body } }),
  );
  return data.note;
}

// ─── Monthly cross-leader analysis ─────────────────────────────────────────

export type MonthlyLeader = CoachMonthly['leaders'][number];

export type CoachMonthly = GetCoachAdminMonthlyResponse;

export type ProgramReport = NonNullable<CoachMonthly['programReport']>;

/** GET /coach/admin/monthly?month=YYYY-MM, program-wide + per-leader rollup. */
export function fetchAdminMonthly(month: string): Promise<CoachMonthly> {
  return coachCall(getCoachAdminMonthly({ client: coachClient, query: { month } }));
}

// ─── Per-leader monthly summary (full parity with the individual monthly PDF)

export type LeaderMonthlyClusterAvg = LeaderMonthlySummary['clusterAvg'];
export type LeaderMonthlyGlanceRow = LeaderMonthlySummary['glance']['rows'][number];
export type LeaderMonthlyCluster = LeaderMonthlySummary['clusters'][number];
export type LeaderMonthlySessionDetail = LeaderMonthlySummary['sessions'][number];
export type LeaderMonthlySummary = NonNullable<LeaderMonthlyResponse['summary']>;

export type LeaderMonthlyResponse = GetCoachMonthlySummaryResponse;

/** GET /coach/monthly-summary?month=YYYY-MM, the signed-in leader's own. */
export function fetchMyMonthlySummary(month: string): Promise<LeaderMonthlyResponse> {
  return coachCall(getCoachMonthlySummary({ client: coachClient, query: { month } }));
}

/** GET /coach/admin/coaches/:id/monthly-summary?month=YYYY-MM, admin drill-in. */
export function fetchLeaderMonthlySummary(
  coachId: string,
  month: string,
): Promise<LeaderMonthlyResponse> {
  return coachCall(getCoachAdminCoachesByIdMonthlySummary({ client: coachClient, path: { id: coachId }, query: { month } }));
}

// ─── Small view helpers (shared across the coach screens) ──────────────────

export function dateLabelOf(report: { date: string; dateLabel?: string }): string {
  return report.dateLabel || shortDate(report.date);
}

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

export function statusColor(
  status: string,
  bandLabels: string[] = [],
): string {
  return spreadOver(bandLabels.indexOf(status), bandLabels.length, STATUS_PALETTE) ?? STATUS_UNKNOWN;
}

export type UploadClass = GetCoachUploadsClassesResponse['classes'][number];

export type UploadParts = PostCoachUploadsResponse;

export type UploadStatus = UploadView['status'];

export type UploadView = GetCoachUploadsResponse['uploads'][number];

export type UploadRequest = PostCoachUploadsData['body'];

export type AdminUploadRequest = PostCoachAdminUploadsData['body'];

export async function fetchUploadClasses(coachId: string | null): Promise<UploadClass[]> {
  const data = await coachCall(
    coachId === null
      ? getCoachUploadsClasses({ client: coachClient })
      : getCoachAdminUploadsClasses({ client: coachClient, query: { coachId } }),
  );
  return data.classes;
}

export async function fetchUploads(admin: boolean, coachId: string | null = null): Promise<UploadView[]> {
  const data = await coachCall(
    !admin
      ? getCoachUploads({ client: coachClient })
      : getCoachAdminUploads({ client: coachClient, ...(coachId ? { query: { coachId } } : {}) }),
  );
  return data.uploads;
}

export function requestUpload(input: UploadRequest | AdminUploadRequest): Promise<UploadParts> {
  return coachCall(
    'coachId' in input ? postCoachAdminUploads({ client: coachClient, body: input }) : postCoachUploads({ client: coachClient, body: input }),
  );
}

export function refreshUploadParts(uploadId: string, admin: boolean): Promise<UploadParts> {
  const options = { client: coachClient, path: { id: uploadId } };
  return coachCall(admin ? postCoachAdminUploadsByIdParts(options) : postCoachUploadsByIdParts(options));
}

export function completeUpload(uploadId: string, admin: boolean): Promise<{ status: UploadStatus }> {
  const options = { client: coachClient, path: { id: uploadId } };
  return coachCall(admin ? postCoachAdminUploadsByIdComplete(options) : postCoachUploadsByIdComplete(options));
}

export async function fetchMonthlyReports(month: string): Promise<MonthlyReportRow[]> {
  return (await coachCall(getCoachAdminMonthlyReports({ client: coachClient, query: { month } }))).reports;
}

export type MonthlyReportEdit = PutCoachAdminMonthlyReportsByIdData['body'];

export function editMonthlyReport(id: number, body: MonthlyReportEdit): Promise<{ edited: boolean }> {
  return coachCall(putCoachAdminMonthlyReportsById({ client: coachClient, path: { id: String(id) }, body }));
}

export function releaseMonthlyReport(id: number): Promise<{ released: boolean; sent: boolean }> {
  return coachCall(postCoachAdminMonthlyReportsByIdRelease({ client: coachClient, path: { id: String(id) } }));
}

export type RotatingClass = GetCoachAdminRotatingClassesResponse['classes'][number];

export type RotatingClassBody = PostCoachAdminRotatingClassesData['body'];

export async function fetchRotatingClasses(): Promise<RotatingClass[]> {
  return (await coachCall(getCoachAdminRotatingClasses({ client: coachClient }))).classes;
}

export function saveRotatingClass(body: RotatingClassBody, id?: number): Promise<{ id: number }> {
  return coachCall(
    id === undefined
      ? postCoachAdminRotatingClasses({ client: coachClient, body })
      : putCoachAdminRotatingClassesById({ client: coachClient, path: { id: String(id) }, body }),
  );
}

export function setRotatingOnly(coachId: string, rotatingOnly: boolean): Promise<{ rotatingOnly: boolean }> {
  return coachCall(putCoachAdminLeadersByIdRotatingOnly({ client: coachClient, path: { id: coachId }, body: { rotatingOnly } }));
}

export type LikelyDuplicate = GetCoachAdminDuplicatesResponse['duplicates'][number];

export async function fetchLikelyDuplicates(): Promise<LikelyDuplicate[]> {
  return (await coachCall(getCoachAdminDuplicates({ client: coachClient }))).duplicates;
}

export function dismissDuplicate(sourceSessionId: string): Promise<{ dismissed: boolean }> {
  return coachCall(postCoachAdminDuplicatesBySourceSessionIdDismiss({ client: coachClient, path: { sourceSessionId } }));
}

export function scoreDuplicateInstead(sourceSessionId: string): Promise<{ queued: boolean }> {
  return coachCall(postCoachAdminDuplicatesBySourceSessionIdScore({ client: coachClient, path: { sourceSessionId } }));
}
