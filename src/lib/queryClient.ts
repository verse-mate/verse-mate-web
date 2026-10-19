import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { captureRequestError } from '@/lib/errorFilters';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => captureRequestError(error, { query_key: query.queryKey }),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) =>
      captureRequestError(error, { mutation_key: mutation.options.mutationKey }),
  }),
});
