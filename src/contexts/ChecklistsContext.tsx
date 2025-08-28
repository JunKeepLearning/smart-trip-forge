import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '@/lib/api';

// --- Data Structures ---
export interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  quantity: number;
  notes?: string;
  category_id: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
}

export interface Checklist {
  id: string;
  name: string;
  tags: string[];
  is_template?: boolean;
  user_id?: string;
  categories: ChecklistCategory[];
  items_count?: number;
  items_checked_count?: number;
}

// --- New API-aligned types for requests ---
type ChecklistUpdateData = Partial<{ name: string; tags: string[] }>;
type CategoryCreateData = { name: string; icon?: string };
type CategoryUpdateData = Partial<CategoryCreateData>;
type ItemCreateData = { name: string; quantity?: number };
type ItemUpdateData = Partial<Omit<ChecklistItem, 'id' | 'category_id'>>;

// --- Context Shape ---
interface ChecklistsContextType {
  checklists: Checklist[];
  isLoading: boolean;
  fetchChecklists: () => Promise<void>;
  getChecklistById: (id: string) => Promise<Checklist | undefined>;
  addChecklist: (data: { name: string; tags: string[] }) => Promise<Checklist | null>;
  updateChecklist: (id: string, data: ChecklistUpdateData) => Promise<void>;
  deleteChecklist: (id: string) => Promise<boolean>;
  addCategory: (checklistId: string, data: CategoryCreateData) => Promise<void>;
  updateCategory: (categoryId: string, data: CategoryUpdateData) => Promise<void>;
  deleteCategory: (checklistId: string, categoryId: string) => Promise<void>;
  addItem: (categoryId: string, data: ItemCreateData) => Promise<void>;
  updateItem: (itemId: string, data: ItemUpdateData) => Promise<void>;
  deleteItem: (categoryId: string, itemId: string) => Promise<void>;
}

const ChecklistsContext = createContext<ChecklistsContextType | undefined>(undefined);

// --- Helper for authenticated fetch ---
const authedFetch = async (url: string, token: string | null, options: RequestInit = {}) => {
  const headers = { ...options.headers, 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    const errorMessage = errorData.detail || 'An unknown error occurred.';
    console.error("API Error:", errorMessage);
    toast({ title: "API Error", description: errorMessage, variant: "destructive" });
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null; // No Content
  return response.json();
};

// --- Provider Component ---
export const ChecklistsProvider = ({ children }: { children: ReactNode }) => {
  // Assume useAuth provides a loading state for its async initialization
  const { session, loading: isAuthLoading } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = session?.user?.id;

  const fetchChecklists = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authedFetch(`${API_BASE_URL}/checklists/`, session?.access_token || null);
      setChecklists(data || []);
    } catch (error) {
      // authedFetch now handles toast
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    // Only fetch data once the authentication state is confirmed (not loading).
    // We depend on the stable `userId` to prevent re-fetching on token refresh.
    if (!isAuthLoading) {
      fetchChecklists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, userId]);

  const getChecklistById = useCallback(async (id: string) => {
    if (!session) return undefined;
    setIsLoading(true);
    try {
      const fullChecklist = await authedFetch(`${API_BASE_URL}/checklists/${id}`, session.access_token);
      // Once full data is fetched, update it in the main state to keep cache fresh
      setChecklists(prev => prev.map(c => c.id === id ? fullChecklist : c));
      return fullChecklist;
    } catch (error) {
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const addChecklist = useCallback(async (data: { name: string; tags: string[] }) => {
    if (!session) return null;
    try {
      const newChecklistInfo = await authedFetch(`${API_BASE_URL}/checklists/`, session.access_token, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const newFullChecklist = { ...newChecklistInfo, categories: [] };
      setChecklists(prev => [newFullChecklist, ...prev]);
      return newFullChecklist;
    } catch (error) {
      return null;
    }
  }, [session]);

  const updateChecklist = useCallback(async (id: string, data: ChecklistUpdateData) => {
    if (!session) return;
    try {
      const updatedChecklist = await authedFetch(`${API_BASE_URL}/checklists/${id}`, session.access_token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setChecklists(prev => prev.map(c => c.id === id ? { ...c, ...updatedChecklist } : c));
      toast({ title: "Checklist Updated", description: `"${data.name}" has been saved.` });
    } catch (error) { /* Handled by authedFetch */ }
  }, [session]);

  const deleteChecklist = useCallback(async (id: string) => {
    if (!session) return false;
    try {
      await authedFetch(`${API_BASE_URL}/checklists/${id}`, session.access_token, { method: 'DELETE' });
      setChecklists(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      return false;
    }
  }, [session]);

  // --- Granular Functions ---

  const addCategory = useCallback(async (checklistId: string, data: CategoryCreateData) => {
    if (!session) return;
    try {
      const newCategory = await authedFetch(`${API_BASE_URL}/checklists/${checklistId}/categories`, session.access_token, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setChecklists(prev => prev.map(c => 
        c.id === checklistId ? { ...c, categories: [...c.categories, { ...newCategory, items: [] }] } : c
      ));
    } catch (error) { /* Handled by authedFetch */ }
  }, [session]);

  const updateCategory = useCallback(async (categoryId: string, data: CategoryUpdateData) => {
    if (!session) return;
    try {
      const updatedCategory = await authedFetch(`${API_BASE_URL}/categories/${categoryId}`, session.access_token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setChecklists(prev => prev.map(c => ({
        ...c,
        categories: c.categories.map(cat => cat.id === categoryId ? { ...cat, ...updatedCategory } : cat)
      })));
    } catch (error) { /* Handled by authedFetch */ }
  }, [session]);

  const deleteCategory = useCallback(async (checklistId: string, categoryId: string) => {
    if (!session) return;
    try {
      await authedFetch(`${API_BASE_URL}/categories/${categoryId}`, session.access_token, { method: 'DELETE' });
      setChecklists(prev => prev.map(c => 
        c.id === checklistId ? { ...c, categories: c.categories.filter(cat => cat.id !== categoryId) } : c
      ));
    } catch (error) { /* Handled by authedFetch */ }
  }, [session]);

  const addItem = useCallback(async (categoryId: string, data: ItemCreateData) => {
    if (!session) return;
    try {
      const newItem = await authedFetch(`${API_BASE_URL}/categories/${categoryId}/items`, session.access_token, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setChecklists(prev => prev.map(c => ({
        ...c,
        categories: c.categories.map(cat => 
          cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat
        )
      })));
    } catch (error) { /* Handled by authedFetch */ }
  }, [session]);

  const updateItem = useCallback(async (itemId: string, data: ItemUpdateData) => {
    if (!session) return;
    try {
      const updatedItem = await authedFetch(`${API_BASE_URL}/items/${itemId}`, session.access_token, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setChecklists(prev => prev.map(c => ({
        ...c,
        categories: c.categories.map(cat => ({
          ...cat,
          items: cat.items.map(item => item.id === itemId ? { ...item, ...updatedItem } : item)
        }))
      })));
    } catch (error) { /* Handled by authedFetch */ }
  }, [session]);

  const deleteItem = useCallback(async (categoryId: string, itemId: string) => {
    if (!session) return;
    try {
      await authedFetch(`${API_BASE_URL}/items/${itemId}`, session.access_token, { method: 'DELETE' });
      setChecklists(prev => prev.map(c => ({
        ...c,
        categories: c.categories.map(cat => 
          cat.id === categoryId ? { ...cat, items: cat.items.filter(item => item.id !== itemId) } : cat
        )
      })));
    } catch (error) { /* Handled by authedFetch */ }
  }, [session]);

  const value = {
    checklists,
    isLoading,
    fetchChecklists,
    getChecklistById,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
  };

  return (
    <ChecklistsContext.Provider value={value}>
      {children}
    </ChecklistsContext.Provider>
  );
};

export const useChecklists = () => {
  const context = useContext(ChecklistsContext);
  if (context === undefined) {
    throw new Error('useChecklists must be used within a ChecklistsProvider');
  }
  return context;
};