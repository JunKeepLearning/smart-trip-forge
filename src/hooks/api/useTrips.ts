import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, mockApi } from '@/lib/api'; // Assuming mockApi is exported for trips
import type { Trip, DayPlan, ItineraryItem } from '@/types';

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
    queryFn: mockApi.getTrips, // Using mockApi for now
  });
};

export const useTrip = (tripId: string | null | undefined) => {
  return useQuery<Trip, Error>({
    queryKey: tripKeys.detail(tripId!),
    // This should ideally use a real API call like api.trips.getById(tripId!)
    // For now, we simulate it by finding it in the mock data from the list query.
    queryFn: async () => {
        const trips = await mockApi.getTrips();
        const trip = trips.find(t => t.id === tripId);
        if (!trip) {
            throw new Error('Trip not found');
        }
        return trip;
    },
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
    mutationFn: mockApi.createTrip, // Using mockApi
    onSuccess: () => invalidate(),
  });
};

export const useUpdateTrip = () => {
  const invalidate = useTripMutation();
  return useMutation<Trip, Error, Partial<Trip> & { id: string }>({
    mutationFn: api.updateTrip, // Assuming a real API for updates
    onSuccess: (_, variables) => invalidate(variables.id),
  });
};

export const useDeleteTrip = () => {
  const invalidate = useTripMutation();
  return useMutation<void, Error, string>({
    mutationFn: api.deleteTrip, // Assuming a real API
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