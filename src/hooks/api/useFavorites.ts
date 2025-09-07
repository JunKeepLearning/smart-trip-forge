import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FavoriteItemIdentifier, FavoriteItemType, Destination, Spot, Route as RouteType } from '@/types';

// --- Query Keys Factory ---
const favoritesKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoritesKeys.all, 'list'] as const,
  list: (filters: string) => [...favoritesKeys.lists(), { filters }] as const,
  details: () => [...favoritesKeys.all, 'detail'] as const,
  detail: (id: string) => [...favoritesKeys.details(), id] as const,
};

// --- Query Hooks ---

export const useFavorites = () => {
  return useQuery<FavoriteItemIdentifier[], Error>({
    queryKey: favoritesKeys.lists(),
    queryFn: api.favorites.getAll,
  });
};

export const useFavoritesDetails = () => {
  return useQuery<(Destination | Spot | RouteType)[], Error>({
    queryKey: favoritesKeys.details(),
    queryFn: api.favorites.getFavoritesDetails,
  });
};

// --- Mutation Hooks with Optimistic Updates ---

interface FavoriteMutationContext {
  previousFavorites?: FavoriteItemIdentifier[];
}

export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation<FavoriteItemIdentifier, Error, { itemId: string; itemType: FavoriteItemType }, FavoriteMutationContext>({
    mutationFn: ({ itemId, itemType }) => api.favorites.add(itemId, itemType),
    
    // Optimistic Update Logic
    onMutate: async ({ itemId, itemType }) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: favoritesKeys.lists() });

      // 2. Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<FavoriteItemIdentifier[]>(favoritesKeys.lists());

      // 3. Optimistically update to the new value
      queryClient.setQueryData<FavoriteItemIdentifier[]>(favoritesKeys.lists(), (old = []) => [
        ...old,
        { item_id: itemId, item_type: itemType },
      ]);

      // 4. Return a context object with the snapshotted value
      return { previousFavorites };
    },

    // If the mutation fails, use the context we returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoritesKeys.lists(), context.previousFavorites);
      }
    },

    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKeys.lists() });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation<null, Error, { itemId: string; itemType: FavoriteItemType }, FavoriteMutationContext>({
    mutationFn: ({ itemId, itemType }) => api.favorites.remove(itemId, itemType),

    onMutate: async ({ itemId, itemType }) => {
      await queryClient.cancelQueries({ queryKey: favoritesKeys.lists() });
      const previousFavorites = queryClient.getQueryData<FavoriteItemIdentifier[]>(favoritesKeys.lists());
      
      queryClient.setQueryData<FavoriteItemIdentifier[]>(favoritesKeys.lists(), (old = []) => 
        old.filter(fav => !(fav.item_id === itemId && fav.item_type === itemType))
      );

      return { previousFavorites };
    },

    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoritesKeys.lists(), context.previousFavorites);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKeys.lists() });
    },
  });
};
