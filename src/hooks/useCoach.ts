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
  type CoachMe,
  type CoachReport,
  type CoachTrends,
  fetchCoachMe,
  fetchCoachReports,
  fetchCoachTrends,
} from '@/services/coachService';

export const coachKeys = {
  me: ['coach', 'me'] as const,
  reports: ['coach', 'reports'] as const,
  trends: ['coach', 'trends'] as const,
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

export function useCoachReports(): UseQueryResult<CoachReport[]> {
  return useQuery({ queryKey: coachKeys.reports, queryFn: fetchCoachReports, retry: false });
}

export function useCoachTrends(): UseQueryResult<CoachTrends> {
  return useQuery({ queryKey: coachKeys.trends, queryFn: fetchCoachTrends, retry: false });
}
