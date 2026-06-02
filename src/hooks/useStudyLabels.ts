import { useQuery } from '@tanstack/react-query';
import { getStudyLabels, type StudyLabels } from '@versemate/studies';
import { fetchStudyLabels } from '@/services/bibleService';

/**
 * Inductive-study UI chrome labels for the given language.
 *
 * Two-tier: the bundled `getStudyLabels` map (en/ro/es) is the synchronous
 * default/offline fallback; the DB-backed `/bible/study-labels` row (any
 * enabled language) is fetched and merged OVER it. So a language with no DB
 * row — or a key the DB row omits — degrades to English per-key rather than
 * blanking, and new languages go live with no app release. Keyed by base ISO
 * so every chapter/sub-renderer shares one cached fetch.
 */
export function useStudyLabels(language?: string): StudyLabels {
  const base = (language ?? 'en').toLowerCase().split('-')[0];
  const { data } = useQuery({
    queryKey: ['study-labels', base],
    queryFn: () => fetchStudyLabels(language ?? 'en'),
    staleTime: 1000 * 60 * 60, // 1h — chrome labels rarely change
    gcTime: 1000 * 60 * 60 * 24,
  });
  return { ...getStudyLabels(language), ...(data ?? {}) };
}
