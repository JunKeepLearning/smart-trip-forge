import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SearchableDestination } from '@/types';

const destinationsKeys = {
  all: ['destinations'] as const,
  searches: () => [...destinationsKeys.all, 'search'] as const,
  search: (query: string) => [...destinationsKeys.searches(), { query }] as const,
};

/**
 * Searches for destinations based on a query string.
 * @param query The search term
 * @returns The result of the React Query query
 */
export const useSearchDestinations = (query: string) => {
  return useQuery<SearchableDestination[], Error>({
    queryKey: destinationsKeys.search(query),
    queryFn: () => api.destinations.search(query),
    // Only run the query if the user has typed at least 2 characters
    enabled: !!query && query.length > 1,
    staleTime: 1000 * 60 * 5, // Cache search results for 5 minutes
  });
};
