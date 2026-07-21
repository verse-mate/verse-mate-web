/**
 * React-Query hooks for the Bible-Coach portal. Centralizes query keys,
 * disables retries (so 401/403 surface immediately as auth gates rather than
 * being retried), and maps CoachAuthError → a `authReason` the screens hand
 * to <CoachStateBoundary>.
 */

import {
  keepPreviousData,
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
  type CoachProfileHeader,
  type CoachReport,
  type CoachSummary,
  type CoachTrends,
  fetchAdminCoaches,
  fetchAdminMonthly,
  fetchAllCoachClasses,
  fetchCoachClasses,
  fetchCoachMe,
  fetchCoachReports,
  fetchCoachReportsFor,
  fetchCoachTrends,
  fetchCoachTrendsFor,
  saveRecordingLink,
} from '@/services/coachService';

export const coachKeys = {
  me: ['coach', 'me'] as const,
  reports: ['coach', 'reports'] as const,
  trends: ['coach', 'trends'] as const,
  classes: ['coach', 'classes'] as const,
  adminCoaches: ['coach', 'admin', 'coaches'] as const,
  adminClasses: ['coach', 'admin', 'classes'] as const,
  adminReports: (id: string) => ['coach', 'admin', 'reports', id] as const,
  adminTrends: (id: string) => ['coach', 'admin', 'trends', id] as const,
  adminMonthly: (month: string) => ['coach', 'admin', 'monthly', month] as const,
};

/** Normalize a query's error into the shape <CoachStateBoundary> expects. */
export function coachState<T>(q: UseQueryResult<T>): {
  loading: boolean;
  authError: CoachAuthReason | null;
  error: boolean;
  data: T | undefined;
} {
  const authError = q.error instanceof CoachAuthError ? q.error.reason : null;
  return {
    loading: q.isLoading,
    authError,
    error: !!q.error && !authError,
    data: q.data,
  };
}

export function useCoachMe(): UseQueryResult<CoachMe> {
  return useQuery({ queryKey: coachKeys.me, queryFn: fetchCoachMe, retry: false });
}

export function useCoachReports(opts: { enabled?: boolean } = {}): UseQueryResult<CoachReport[]> {
  return useQuery({
    queryKey: coachKeys.reports,
    queryFn: fetchCoachReports,
    retry: false,
    enabled: opts.enabled ?? true,
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

export function useAdminClasses(): UseQueryResult<AdminCoachClass[]> {
  return useQuery({ queryKey: coachKeys.adminClasses, queryFn: fetchAllCoachClasses, retry: false });
}

export function useAdminCoaches(): UseQueryResult<CoachSummary[]> {
  return useQuery({ queryKey: coachKeys.adminCoaches, queryFn: fetchAdminCoaches, retry: false });
}

export function useCoachReportsFor(
  coachId: string,
): UseQueryResult<{ profile: CoachProfileHeader; reports: CoachReport[] }> {
  return useQuery({
    queryKey: coachKeys.adminReports(coachId),
    queryFn: () => fetchCoachReportsFor(coachId),
    retry: false,
    enabled: !!coachId,
  });
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
