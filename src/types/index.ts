// src/types/index.ts

// --- Trip Related Types ---

export interface ItineraryItem {
  id: string;
  time?: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'custom';
  name: string;
  notes?: string;
}

export interface DayPlan {
  id: string;
  day: number;
  date: string;
  title: string;
  items: ItineraryItem[];
}

export interface Collaborator {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  status: "Not Started" | "In Progress" | "Completed";
  thumbnail?: string;
  createdAt: string;
  itinerary?: DayPlan[];
  collaborators?: Collaborator[];
}


// --- Checklist Related Types ---

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

export interface ChecklistCounts {
  total: number;
  checked: number;
}

export interface Checklist {
  id: string;
  name: string;
  tags: string[];
  is_template?: boolean;
  user_id?: string;
  categories: ChecklistCategory[];
  counts?: ChecklistCounts;
}

// --- Favorite Related Types ---

export type FavoriteItemType = 'destination' | 'spot' | 'route';

export interface FavoriteItemIdentifier {
  item_id: string;
  item_type: FavoriteItemType;
  user_id?: string; 
}

// --- Content Types for Favorites & Explore ---

export interface Destination {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  highlights?: string[];
}

export interface Spot {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  destination_id?: string;
  destination?: string; // denormalized name
  category?: string;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  startCity?: string;
  endCity?: string;
  days?: number;
  tags?: string[];
  spot_ids?: string[];
}

export interface ExploreData {
  featuredDestinations: Destination[];
  popularRoutes: Route[];
  topSpots: Spot[];
}

// --- Other specific types ---

export interface SearchableDestination {
  city: string;
  country: string;
  description: string;
}