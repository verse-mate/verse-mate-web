/**
 * React-Query hooks for the Bible-Coach portal. Centralizes query keys,
 * disables retries (so 401/403 surface immediately as auth gates rather than
 * being retried), and maps CoachAuthError → a `authReason` the screens hand
 * to <CoachStateBoundary>.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  CoachAuthError,
  type CoachAuthReason,
  type CoachClass,
  type CoachMe,
  type CoachProfileHeader,
  type CoachReport,
  type CoachSummary,
  type CoachTrends,
  fetchAdminCoaches,
  fetchCoachClasses,
  fetchCoachMe,
  fetchCoachReports,
  fetchCoachReportsFor,
  fetchCoachTrends,
  fetchCoachTrendsFor,
} from '@/services/coachService';

export const coachKeys = {
  me: ['coach', 'me'] as const,
  reports: ['coach', 'reports'] as const,
  trends: ['coach', 'trends'] as const,
  classes: ['coach', 'classes'] as const,
  adminCoaches: ['coach', 'admin', 'coaches'] as const,
  adminReports: (id: string) => ['coach', 'admin', 'reports', id] as const,
  adminTrends: (id: string) => ['coach', 'admin', 'trends', id] as const,
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
