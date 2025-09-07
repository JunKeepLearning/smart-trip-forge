import { create } from 'zustand';

/**
 * This store is intended for client-side UI state related to trips.
 * For example: filter settings, sorting preferences, etc.
 * 
 * Server state, including the list of trips, is now managed by React Query.
 */

// Example of a potential client-side state
interface TripsUIState {
  filter: string;
  setFilter: (filter: string) => void;
}

export const useTripsUIStore = create<TripsUIState>((set) => ({
  filter: '',
  setFilter: (filter) => set({ filter }),
}));