import { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { queryClient } from '@/lib/queryClient';

export function ClearQueriesOnAccountChange() {
  const { state } = useApp();
  const seen = useRef(state.userId);
  useEffect(() => {
    if (seen.current && seen.current !== state.userId) queryClient.clear();
    seen.current = state.userId;
  }, [state.userId]);
  return null;
}
