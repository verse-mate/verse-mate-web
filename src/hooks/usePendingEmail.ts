import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchPendingEmail } from '@/services/bibleService';

export const pendingEmailKeys = {
  user: (userId: string) => ['auth', 'pending-email', userId] as const,
};

export function usePendingEmail(userId: string | null | undefined): UseQueryResult<string | null> {
  return useQuery({
    queryKey: pendingEmailKeys.user(userId ?? ''),
    queryFn: fetchPendingEmail,
    enabled: !!userId,
    retry: false,
  });
}

export function useSetPendingEmail(userId: string | null | undefined) {
  const queryClient = useQueryClient();
  return useCallback(
    (pendingEmail: string | null) => {
      if (!userId) return;
      void queryClient.cancelQueries({ queryKey: pendingEmailKeys.user(userId) });
      queryClient.setQueryData(pendingEmailKeys.user(userId), pendingEmail);
    },
    [queryClient, userId],
  );
}
