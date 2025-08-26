import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext'; // Import the useAuth hook

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

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
  // ... other functions will be updated later
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

  const value = {
    checklists,
    isLoading,
    getChecklistById,
    updateChecklist,
    // Other functions (add, update, delete) will be implemented next
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