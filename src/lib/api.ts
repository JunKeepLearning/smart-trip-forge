import { useAuthStore } from '@/stores/auth';
import { toast } from "@/components/ui/use-toast";
import type { 
  Checklist, 
  ChecklistCategory, 
  ChecklistItem, 
  Trip, 
  FavoriteItemType, 
  FavoriteItemIdentifier, 
  Destination,
  Spot,
  Route as RouteType,
  ExploreData,
  SearchableDestination
} from '@/types';

// --- Configuration ---
// In a real app, this would come from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// --- Centralized API Fetch Client ---

/**
 * A wrapper around fetch that automatically handles authentication, 
 * content type, and unified error handling.
 * @param url - The URL to fetch, relative to API_BASE_URL
 * @param options - Standard fetch options
 * @returns The JSON response
 */
const authedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().session?.access_token;

  // Allow certain public endpoints to be fetched without a token
  const publicEndpoints = ['/explore', '/destinations/search'];
  if (!token && !publicEndpoints.some(p => endpoint.startsWith(p))) {
    const error = new Error("No authentication token provided. Please log in.");
    toast({ title: "Authentication Error", description: error.message, variant: "destructive" });
    throw error;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch (networkError: any) {
    const error = new Error(`Network error: ${networkError.message}`);
    toast({ title: "Network Error", description: "Failed to connect to the server.", variant: "destructive" });
    throw error;
  }

  if (!response.ok) {
    let errorMessage = "An unknown error occurred.";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || `API Error (${response.status})`;
    } catch {
      errorMessage = `API Error (${response.status}) - ${response.statusText}`;
    }
    toast({ title: "API Error", description: errorMessage, variant: "destructive" });
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null; // Handle No Content response
  return response.json();
};

// --- Type definitions for API method arguments ---
type ChecklistUpdateData = Partial<{ name: string; tags: string[] }>;
type CategoryCreateData = { name: string; icon?: string };
type CategoryUpdateData = Partial<CategoryCreateData>;
type ItemCreateData = { name: string; quantity?: number };
type ItemUpdateData = Partial<Omit<ChecklistItem, "id" | "category_id">>;

// --- Structured API Methods ---

export const api = {
  checklists: {
    getAll: (): Promise<Checklist[]> => authedFetch('/checklists'),
    getById: (id: string): Promise<Checklist> => authedFetch(`/checklists/${id}`),
    create: (data: { name: string; tags: string[] }): Promise<Checklist> => authedFetch('/checklists', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: ChecklistUpdateData): Promise<Checklist> => authedFetch(`/checklists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string): Promise<null> => authedFetch(`/checklists/${id}`, { method: 'DELETE' }),
  },
  categories: {
    create: (checklistId: string, data: CategoryCreateData): Promise<ChecklistCategory> => authedFetch(`/checklists/${checklistId}/categories`, { method: 'POST', body: JSON.stringify(data) }),
    update: (categoryId: string, data: CategoryUpdateData): Promise<ChecklistCategory> => authedFetch(`/categories/${categoryId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (categoryId: string): Promise<null> => authedFetch(`/categories/${categoryId}`, { method: 'DELETE' }),
  },
  items: {
    create: (categoryId: string, data: ItemCreateData): Promise<ChecklistItem> => authedFetch(`/categories/${categoryId}/items`, { method: 'POST', body: JSON.stringify(data) }),
    update: (itemId: string, data: ItemUpdateData): Promise<ChecklistItem> => authedFetch(`/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (itemId: string): Promise<null> => authedFetch(`/items/${itemId}`, { method: 'DELETE' }),
  },
  favorites: {
    getAll: (): Promise<FavoriteItemIdentifier[]> => authedFetch('/favorites'),
    getFavoritesDetails: (): Promise<(Destination | Spot | RouteType)[]> => authedFetch('/favorites/details'),
    add: (itemId: string, itemType: FavoriteItemType): Promise<FavoriteItemIdentifier> => authedFetch('/favorites', { method: 'POST', body: JSON.stringify({ item_id: itemId, item_type: itemType }) }),
    remove: (itemId: string, itemType: FavoriteItemType): Promise<null> => authedFetch(`/favorites`, { method: 'DELETE', body: JSON.stringify({ item_id: itemId, item_type: itemType }) }),
  },
  explore: {
    get: (): Promise<ExploreData> => authedFetch('/explore'),
  },
  destinations: {
    search: (query: string): Promise<SearchableDestination[]> => authedFetch(`/destinations/search?q=${encodeURIComponent(query)}`),
  }
};


// --- Mock API for Trips (to be replaced later) ---

const mockTrips: Trip[] = [
  {
    id: "1", name: "Beijing Cultural Journey", destination: "Beijing, China", startDate: "2024-03-15", endDate: "2024-03-20",
    description: "6-day exploration of historic Beijing", status: "In Progress", createdAt: "2024-02-10",
    itinerary: [], collaborators: []
  },
  { 
    id: "2", name: "Shanghai Modern Adventure", destination: "Shanghai, China", startDate: "2024-04-10", endDate: "2024-04-14",
    description: "5-day modern city experience", status: "Not Started", createdAt: "2024-02-15",
    itinerary: [], collaborators: []
  }
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockApi = {
  getTrips: async (): Promise<Trip[]> => {
    await delay(500);
    return mockTrips;
  },
  createTrip: async (newTripData: Omit<Trip, 'id' | 'status' | 'createdAt' | 'itinerary' | 'collaborators'>): Promise<Trip> => {
    await delay(500);
    const newTrip: Trip = {
      id: Date.now().toString(), status: "Not Started", createdAt: new Date().toISOString(), itinerary: [], collaborators: [], ...newTripData,
    };
    mockTrips.unshift(newTrip);
    return newTrip;
  },
  // ... other mock trip functions
};
