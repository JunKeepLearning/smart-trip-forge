import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext'; // Import the useAuth hook
import { API_BASE_URL } from '@/lib/api';

// Data structures for Checklists
export interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  quantity: number;
  notes?: string;
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
  is_template?: boolean; // To identify public templates
  user_id?: string; // To identify owner
  categories: ChecklistCategory[];
}

// Define the shape of the context
interface ChecklistsContextType {
  checklists: Checklist[];
  isLoading: boolean;
  getChecklistById: (id: string) => Promise<Checklist | undefined>;
  updateChecklist: (updatedChecklist: Checklist) => Promise<boolean>;
  addChecklist: (newChecklist: { name: string; tags: string[] }) => Promise<Checklist | null>;
  deleteChecklist: (id: string) => Promise<boolean>;
}

// Create the context
const ChecklistsContext = createContext<ChecklistsContextType | undefined>(undefined);

// Create a helper for authenticated fetch
const authedFetch = async (url: string, token: string | null, options: RequestInit = {}) => {
  const headers = { ...options.headers, 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = new Error(`An error occurred while fetching: ${response.statusText}`);
    // You can add more error details if needed, e.g., from response body
    throw error;
  }

  if (response.status === 204) { // No Content
    return null;
  }

  return response.json();
};


// Create the provider component
export const ChecklistsProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth(); // Use the session from AuthContext
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChecklists = useCallback(async () => {
    setIsLoading(true);
    try {
      // The backend will return public templates if token is null,
      // or user-specific checklists if token is provided.
      const data = await authedFetch(`${API_BASE_URL}/checklists/`, session?.access_token || null);
      setChecklists(data || []);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load checklists.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [session]); // Re-run when session changes (login/logout)

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const getChecklistById = async (id: string) => {
    setIsLoading(true);
    try {
      return await authedFetch(`${API_BASE_URL}/checklists/${id}`, session?.access_token || null);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load checklist details.", variant: "destructive" });
      return undefined;
    } finally {
        setIsLoading(false);
    }
  };

  const updateChecklist = async (updatedChecklist: Checklist): Promise<boolean> => {
    if (!session) {
      toast({ title: "Authentication Error", description: "You must be logged in to save changes.", variant: "destructive" });
      return false;
    }

    setIsLoading(true);
    try {
      await authedFetch(`${API_BASE_URL}/checklists/${updatedChecklist.id}`, session.access_token, {
        method: 'PUT',
        body: JSON.stringify(updatedChecklist),
      });

      // Update local state optimistically or refetch
      setChecklists(prev => prev.map(c => c.id === updatedChecklist.id ? updatedChecklist : c));
      return true;
    } catch (error) {
      console.error("Failed to update checklist:", error);
      toast({ title: "Save Failed", description: "Your changes could not be saved to the server.", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addChecklist = async (newChecklist: { name: string; tags: string[] }): Promise<Checklist | null> => {
    if (!session) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a checklist.", variant: "destructive" });
      return null;
    }

    setIsLoading(true);
    try {
      const createdChecklist = await authedFetch(`${API_BASE_URL}/checklists/`, session.access_token, {
        method: 'POST',
        body: JSON.stringify(newChecklist),
      });
      
      // Add the new checklist to the top of the list
      setChecklists(prev => [createdChecklist, ...prev]);
      return createdChecklist;
    } catch (error) {
      console.error("Failed to create checklist:", error);
      toast({ title: "Creation Failed", description: "The new checklist could not be created.", variant: "destructive" });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChecklist = async (id: string): Promise<boolean> => {
    if (!session) {
      toast({ title: "Authentication Error", description: "You must be logged in to delete a checklist.", variant: "destructive" });
      return false;
    }

    setIsLoading(true);
    try {
      await authedFetch(`${API_BASE_URL}/checklists/${id}`, session.access_token, {
        method: 'DELETE',
      });

      // Remove the checklist from the list
      setChecklists(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.error("Failed to delete checklist:", error);
      toast({ title: "Deletion Failed", description: "The checklist could not be deleted.", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    checklists,
    isLoading,
    getChecklistById,
    updateChecklist,
    addChecklist,
    deleteChecklist,
  } as ChecklistsContextType;

  return (
    <ChecklistsContext.Provider value={value}>
      {children}
    </ChecklistsContext.Provider>
  );
};

// Create a custom hook for easy consumption
export const useChecklists = () => {
  const context = useContext(ChecklistsContext);
  if (context === undefined) {
    throw new Error('useChecklists must be used within a ChecklistsProvider');
  }
  return context;
};