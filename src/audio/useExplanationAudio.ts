/**
 * useExplanationAudio — TanStack Query wrapper around fetchAudioWithPolling.
 * Surfaces the 5 inline-entry states (loading / generating / error /
 * populated / playing-state-change-via-context).
 */
import { useQuery } from '@tanstack/react-query';
import { fetchAudioWithPolling, type ReaderAudio } from './audioApi';

export interface UseExplanationAudioArgs {
  explanationId: number | null;
  voice?: string;
  language?: string;
  enabled?: boolean;
}

export interface UseExplanationAudioResult {
  audio: ReaderAudio | null;
  isLoading: boolean;
  isGenerating: boolean;
  estimatedReadySeconds: number | null;
  error: Error | null;
}

export function useExplanationAudio(
  args: UseExplanationAudioArgs,
): UseExplanationAudioResult {
  const { explanationId, voice, language, enabled = true } = args;

  const query = useQuery({
    queryKey: ['explanation-audio', explanationId, voice, language] as const,
    enabled: enabled && explanationId !== null,
    queryFn: ({ signal }) =>
      fetchAudioWithPolling({
        explanationId: explanationId as number,
        voice,
        language,
        signal,
      }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isGenerating = query.fetchStatus === 'fetching' && !query.data;

  return {
    audio: query.data ?? null,
    isLoading: query.isLoading,
    isGenerating,
    estimatedReadySeconds: isGenerating ? 8 : null,
    error: query.error instanceof Error ? query.error : null,
  };
}
