import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { learning, learningAdmin } from '@/services/coachLearning';

export const learningKeys = {
  state: ['coach', 'learning'] as const,
  lesson: (id: number) => ['coach', 'learning', 'lesson', id] as const,
  video: (id: number, admin: boolean) => ['coach', 'learning', 'video', id, admin] as const,
  check: (id: number) => ['coach', 'learning', 'check', id] as const,
  admin: ['coach', 'admin', 'learning'] as const,
  preview: (id: number) => ['coach', 'admin', 'learning', 'preview', id] as const,
  requests: ['coach', 'admin', 'learning', 'requests'] as const,
  learners: (q: string, offset: number) => ['coach', 'admin', 'learning', 'learners', q, offset] as const,
};

export function useLearningState(opts: { enabled?: boolean } = {}) {
  const { state } = useApp();
  return useQuery({
    queryKey: learningKeys.state,
    queryFn: learning.state,
    retry: false,
    enabled: state.isSignedIn && (opts.enabled ?? true),
  });
}

export function useLearningOpen(opts: { enabled?: boolean } = {}): boolean {
  return useLearningState(opts).data?.open ?? false;
}

export function useLearningTree() {
  return useQuery({ queryKey: learningKeys.admin, queryFn: learningAdmin.tree, retry: false });
}

export function useJoinRequests() {
  return useQuery({ queryKey: learningKeys.requests, queryFn: learningAdmin.requests, retry: false });
}
