import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ExploreData } from '@/types';

const exploreKeys = {
  all: ['explore'] as const,
};

/**
 * Fetches the data for the main Explore page.
 * This includes featured destinations, popular routes, and top spots.
 */
export const useExploreData = () => {
  return useQuery<ExploreData, Error>({
    queryKey: exploreKeys.all,
    // This uses a non-authed fetch for public data.
    // If auth is needed, you would use a function that calls authedFetch.
    queryFn: api.explore.get, 
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};