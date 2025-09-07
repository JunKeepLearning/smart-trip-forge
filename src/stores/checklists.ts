import { create } from 'zustand';

/**
 * This store is intended for client-side UI state related to checklists.
 * For example: filter settings, sorting preferences, etc.
 * 
 * Server state, including checklists and their items, is now managed by React Query.
 */

// Example of a potential client-side state
interface ChecklistsUIState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const useChecklistsUIStore = create<ChecklistsUIState>((set) => ({
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
}));