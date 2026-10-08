/**
 * React-Query hooks for the Bible-Coach portal. Centralizes query keys,
 * disables retries (so 401/403 surface immediately as auth gates rather than
 * being retried), and maps CoachAuthError → a `authReason` the screens hand
 * to <CoachStateBoundary>.
 */

import {
  keepPreviousData,
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  type InfiniteData,
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  addCoachLeader,
  addCoachNote,
  CoachAuthError,
  type CoachAuthReason,
  type AdminCoachClass,
  type CoachClass,
  type CoachMe,
  type CoachMonthly,
  type CoachNote,
  type CoachReport,
  type CoachSummary,
  type CoachTrends,
  fetchAdminCoaches,
  fetchAdminMonthly,
  fetchLeaderMonthlySummary,
  fetchMyMonthlySummary,
  type LeaderMonthlyResponse,
  fetchAllCoachClasses,
  fetchCoachClasses,
  fetchCoachMe,
  fetchCoachReportDetail,
  fetchCoachReportSummaries,
  type CoachReportSummaryPage,
  REPORT_PAGE_SIZE,
  fetchCoachTrends,
  fetchCoachTrendsFor,
  saveRecordingLink,
  fetchPipelineFailures,
  requeuePipelineFailure,
  releaseHeldReport,
  fetchCoverage,
  type PipelineFailure,
  type CoverageReport,
  type ReleaseOutcome,
  updateLeaderEmail,
  attributeSession,
  setNotTeaching,
  amendReport,
  fetchReportReview,
  fetchReportRevisions,
  sendRevision,
  setFirstLesson,
  fetchLeaderAttribution,
  saveLeaderAttribution,
  type LeaderAttribution,
  type ReportAmendment,
  type ReportReviewState,
  type ReportRevision,
  type RevisionResult,
  type RevisionSendResult,
} from '@/services/coachService';

export const coachKeys = {
  me: ['coach', 'me'] as const,
  reports: ['coach', 'reports'] as const,
  trends: ['coach', 'trends'] as const,
  classes: ['coach', 'classes'] as const,
  adminCoaches: ['coach', 'admin', 'coaches'] as const,
  adminClasses: ['coach', 'admin', 'classes'] as const,
  pipelineFailures: ['coach', 'admin', 'pipeline-failures'] as const,
  coverage: ['coach', 'admin', 'coverage'] as const,
  attribution: (coachId: string) => ['coach', 'admin', 'attribution', coachId] as const,
  adminReports: (id: string) => ['coach', 'admin', 'reports', id] as const,
  reportReview: (reportId: string) => ['coach', 'admin', 'review', reportId] as const,
  reportRevisions: (reportId: string) => ['coach', 'admin', 'revisions', reportId] as const,
  adminTrends: (id: string) => ['coach', 'admin', 'trends', id] as const,
  adminMonthly: (month: string) => ['coach', 'admin', 'monthly', month] as const,
  monthlySummary: (month: string) => ['coach', 'monthly-summary', month] as const,
  adminMonthlySummary: (id: string, month: string) =>
    ['coach', 'admin', 'monthly-summary', id, month] as const,
};

export function coachState<T>(q: {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  isFetchNextPageError?: boolean;
}): {
  loading: boolean;
  authError: CoachAuthReason | null;
  error: boolean;
  data: T | undefined;
} {
  const authError = q.error instanceof CoachAuthError ? q.error.reason : null;
  return {
    loading: q.isLoading,
    authError,
    error: !!q.error && !authError && !q.isFetchNextPageError,
    data: q.data,
  };
}

export function useCoachMe(): UseQueryResult<CoachMe> {
  return useQuery({ queryKey: coachKeys.me, queryFn: fetchCoachMe, retry: false });
}

function reportsKey(coachId?: string) {
  return coachId ? coachKeys.adminReports(coachId) : coachKeys.reports;
}

export function useCoachReportSummaries(
  opts: { enabled?: boolean; coachId?: string } = {},
): UseInfiniteQueryResult<InfiniteData<CoachReportSummaryPage, number>> {
  return useInfiniteQuery({
    queryKey: [...reportsKey(opts.coachId), 'summary'],
    queryFn: ({ pageParam }) => fetchCoachReportSummaries(pageParam, REPORT_PAGE_SIZE, opts.coachId),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total && last.items.length > 0 ? loaded : undefined;
    },
    retry: false,
    enabled: opts.enabled ?? true,
  });
}

export function useCoachReportDetail(
  reportId: string | undefined,
  coachId?: string,
): UseQueryResult<CoachReport | null> {
  return useQuery({
    queryKey: [...reportsKey(coachId), 'detail', reportId ?? ''],
    queryFn: () => fetchCoachReportDetail(reportId as string, coachId),
    enabled: Boolean(reportId),
    retry: false,
  });
}

export function useCoachTrends(opts: { enabled?: boolean } = {}): UseQueryResult<CoachTrends> {
  return useQuery({
    queryKey: coachKeys.trends,
    queryFn: fetchCoachTrends,
    retry: false,
    enabled: opts.enabled ?? true,
  });
}

export function useCoachClasses(opts: { enabled?: boolean } = {}): UseQueryResult<CoachClass[]> {
  return useQuery({
    queryKey: coachKeys.classes,
    queryFn: fetchCoachClasses,
    retry: false,
    enabled: opts.enabled ?? true,
  });
}

// ─── Admin oversight ────────────────────────────────────────────────────────

export function useAdminClasses(opts: { enabled?: boolean } = {}): UseQueryResult<AdminCoachClass[]> {
  return useQuery({
    queryKey: coachKeys.adminClasses,
    queryFn: fetchAllCoachClasses,
    retry: false,
    enabled: opts.enabled ?? true,
  });
}

export function useAdminCoaches(): UseQueryResult<CoachSummary[]> {
  return useQuery({ queryKey: coachKeys.adminCoaches, queryFn: fetchAdminCoaches, retry: false });
}

export function useAdminLeader(coachId: string | undefined): CoachSummary | undefined {
  const roster = useQuery({
    queryKey: coachKeys.adminCoaches,
    queryFn: fetchAdminCoaches,
    retry: false,
    enabled: !!coachId,
  });
  return roster.data?.find((c) => c.id === coachId);
}

export function useCoachTrendsFor(coachId: string): UseQueryResult<CoachTrends> {
  return useQuery({
    queryKey: coachKeys.adminTrends(coachId),
    queryFn: () => fetchCoachTrendsFor(coachId),
    retry: false,
    enabled: !!coachId,
  });
}

export function useAdminMonthly(month: string): UseQueryResult<CoachMonthly> {
  return useQuery({
    queryKey: coachKeys.adminMonthly(month),
    queryFn: () => fetchAdminMonthly(month),
    retry: false,
    enabled: !!month,
    // Keep showing the prior month's data (and the month picker) while the
    // next month loads, so stepping between months doesn't flash a spinner.
    placeholderData: keepPreviousData,
  });
}

/** The signed-in leader's own monthly summary for a month. */
export function useMyMonthlySummary(month: string): UseQueryResult<LeaderMonthlyResponse> {
  return useQuery({
    queryKey: coachKeys.monthlySummary(month),
    queryFn: () => fetchMyMonthlySummary(month),
    retry: false,
    enabled: !!month,
    placeholderData: keepPreviousData,
  });
}

/** A specific leader's monthly summary (admin drill-in). */
export function useLeaderMonthlySummary(
  coachId: string,
  month: string,
): UseQueryResult<LeaderMonthlyResponse> {
  return useQuery({
    queryKey: coachKeys.adminMonthlySummary(coachId, month),
    queryFn: () => fetchLeaderMonthlySummary(coachId, month),
    retry: false,
    enabled: !!coachId && !!month,
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[3] === coachId ? keepPreviousData(previous) : undefined,
  });
}

// ─── Admin mutations ─────────────────────────────────────────────────────────

/** Add a leader by email; refreshes the roster on success. */
export function useAddLeader(): UseMutationResult<
  CoachSummary,
  Error,
  { email: string; name?: string; group?: string; coachName?: string }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addCoachLeader,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: coachKeys.adminCoaches });
    },
  });
}

/** Save (or clear) a session's recording URL; refreshes that leader's reports. */
export function useSetRecordingLink(
  coachId: string,
): UseMutationResult<string, Error, { reportId: string; recordingUrl: string }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, recordingUrl }) =>
      saveRecordingLink(coachId, reportId, recordingUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: coachKeys.adminReports(coachId) });
    },
  });
}

/** Post a coaching note on a session; refreshes that leader's reports (and the
 *  leader's own reports view, where the note renders read-only). */
export function useAddNote(
  coachId: string,
): UseMutationResult<CoachNote, Error, { reportId: string; body: string }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, body }) => addCoachNote(coachId, reportId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: coachKeys.adminReports(coachId) });
      qc.invalidateQueries({ queryKey: coachKeys.reports });
    },
  });
}

export function usePipelineFailures(): UseQueryResult<PipelineFailure[]> {
  return useQuery({ queryKey: coachKeys.pipelineFailures, queryFn: fetchPipelineFailures, retry: false });
}

export function useCoverage(): UseQueryResult<CoverageReport> {
  return useQuery({ queryKey: coachKeys.coverage, queryFn: () => fetchCoverage(), retry: false });
}

export function useRequeuePipelineFailure(): UseMutationResult<{ requeued: boolean }, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requeuePipelineFailure,
    onSuccess: () => qc.invalidateQueries({ queryKey: coachKeys.pipelineFailures }),
  });
}

export function useReleaseHeldReport(): UseMutationResult<ReleaseOutcome, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: releaseHeldReport,
    onSuccess: (outcome) => {
      if (outcome.delivered) qc.invalidateQueries({ queryKey: coachKeys.pipelineFailures });
    },
  });
}

export function useUpdateLeaderEmail(): UseMutationResult<string, Error, { coachId: string; email: string }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coachId, email }) => updateLeaderEmail(coachId, email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: coachKeys.coverage });
      qc.invalidateQueries({ queryKey: coachKeys.pipelineFailures });
    },
  });
}

export function useAttributeSession(): UseMutationResult<
  { coachId: string; state: string },
  Error,
  { sourceSessionId: string; coachId: string }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceSessionId, coachId }) => attributeSession(sourceSessionId, coachId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: coachKeys.pipelineFailures });
      qc.invalidateQueries({ queryKey: coachKeys.coverage });
    },
  });
}

export function useSetNotTeaching(): UseMutationResult<{ attested: boolean }, Error, { coachId: string; attested: boolean }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coachId, attested }) => setNotTeaching(coachId, attested),
    onSuccess: () => qc.invalidateQueries({ queryKey: coachKeys.coverage }),
  });
}

export function useReportReview(reportId: string): UseQueryResult<ReportReviewState | null> {
  return useQuery({ queryKey: coachKeys.reportReview(reportId), queryFn: () => fetchReportReview(reportId), retry: false });
}

export function useReportRevisions(reportId: string, enabled: boolean): UseQueryResult<ReportRevision[]> {
  return useQuery({
    queryKey: coachKeys.reportRevisions(reportId),
    queryFn: () => fetchReportRevisions(reportId),
    retry: false,
    enabled,
  });
}

function useRefreshReport(coachId: string, reportId: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: coachKeys.reportReview(reportId) });
    qc.invalidateQueries({ queryKey: coachKeys.reportRevisions(reportId) });
    qc.invalidateQueries({ queryKey: coachKeys.adminReports(coachId) });
    qc.invalidateQueries({ queryKey: coachKeys.adminTrends(coachId) });
    qc.invalidateQueries({ queryKey: coachKeys.reports });
  };
}

export function useAmendReport(coachId: string, reportId: string): UseMutationResult<RevisionResult, Error, ReportAmendment> {
  const refresh = useRefreshReport(coachId, reportId);
  return useMutation({
    mutationFn: (amendment) => amendReport(reportId, amendment),
    onSuccess: (result) => {
      if (result.applied) refresh();
    },
  });
}

export function useSendRevision(coachId: string, reportId: string): UseMutationResult<RevisionSendResult, Error, void> {
  const refresh = useRefreshReport(coachId, reportId);
  return useMutation({ mutationFn: () => sendRevision(reportId), onSettled: refresh });
}

export function useSetFirstLesson(
  coachId: string,
  reportId: string,
): UseMutationResult<RevisionResult, Error, { firstLesson: boolean; score?: number; rationale?: string }> {
  const refresh = useRefreshReport(coachId, reportId);
  return useMutation({
    mutationFn: (input) => setFirstLesson(reportId, input),
    onSuccess: (result) => {
      if (result.applied) refresh();
    },
  });
}

export function useLeaderAttribution(coachId: string, enabled: boolean): UseQueryResult<LeaderAttribution> {
  return useQuery({
    queryKey: coachKeys.attribution(coachId),
    queryFn: () => fetchLeaderAttribution(coachId),
    retry: false,
    enabled,
  });
}

export function useSaveLeaderAttribution(
  coachId: string,
): UseMutationResult<LeaderAttribution & { resolved: number }, Error, LeaderAttribution> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attribution) => saveLeaderAttribution(coachId, attribution),
    onSuccess: (saved) => {
      qc.setQueryData(coachKeys.attribution(coachId), { titleMatch: saved.titleMatch, altEmails: saved.altEmails });
      qc.invalidateQueries({ queryKey: coachKeys.pipelineFailures });
      qc.invalidateQueries({ queryKey: coachKeys.coverage });
    },
  });
}
