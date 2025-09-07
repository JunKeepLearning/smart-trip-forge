import { create } from 'zustand';

/**
 * This store is intended for client-side UI state related to favorites.
 * For example: filter settings, sorting preferences, etc.
 * 
 * Server state, including the list of favorited items, is now managed by React Query.
 */

interface FavoritesUIState {
  // Example state
  showOnly: 'destination' | 'spot' | 'route' | 'all';
  setShowOnly: (filter: FavoritesUIState['showOnly']) => void;
}

export const useFavoritesUIStore = create<FavoritesUIState>((set) => ({
  showOnly: 'all',
  setShowOnly: (filter) => set({ showOnly: filter }),
}));
