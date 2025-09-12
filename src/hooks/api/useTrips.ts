import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api'; // Assuming mockApi is exported for trips
import type { Trip, DayPlan } from '@/types';

// --- Query Keys Factory ---
const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (filters: string) => [...tripKeys.lists(), { filters }] as const,
  details: () => [...tripKeys.all, 'detail'] as const,
  detail: (id: string) => [...tripKeys.details(), id] as const,
};

// --- Query Hooks ---

export const useTrips = () => {
  return useQuery<Trip[], Error>({
    queryKey: tripKeys.lists(),
    queryFn: api.trips.getAll,
  });
};

export const useTrip = (tripId: string | null | undefined) => {
  return useQuery<Trip, Error>({
    queryKey: tripKeys.detail(tripId!),
    queryFn: () => api.trips.getById(tripId!),
    enabled: !!tripId,
  });
};

// --- Mutation Hooks ---

const useTripMutation = () => {
    const queryClient = useQueryClient();
    return (tripId?: string) => {
        // Invalidate both the list and the specific detail query
        queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
        if (tripId) {
            queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
        }
    };
}

export const useCreateTrip = () => {
  const invalidate = useTripMutation();
  return useMutation({
    mutationFn: api.trips.create,
    onSuccess: () => invalidate(),
  });
};

export const useUpdateTrip = () => {
  const invalidate = useTripMutation();
  return useMutation<Trip, Error, Partial<Trip> & { id: string }>({
    mutationFn: (data) => api.trips.update(data.id, data),
    onSuccess: (_, variables) => invalidate(variables.id),
  });
};

export const useDeleteTrip = () => {
  const invalidate = useTripMutation();
  return useMutation<void, Error, string>({
    mutationFn: api.trips.delete,
    onSuccess: () => invalidate(),
  });
};

// --- Itinerary-Specific Mutation Hooks ---

export const useUpdateItinerary = () => {
    const queryClient = useQueryClient();
    const updateTripMutation = useUpdateTrip();

    return (tripId: string, newItinerary: DayPlan[]) => {
        return updateTripMutation.mutate({ id: tripId, itinerary: newItinerary });
    };
}