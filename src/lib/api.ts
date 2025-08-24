export interface Destination {
  id: string; // Changed to string to be more generic
  name: string;
  description: string;
  image: string;
  highlights: string[];
}

export interface Route {
  id: string; // Changed to string
  name: string;
  startCity: string;
  endCity: string;
  days: number;
  tags: string[];
  description: string;
}

export interface Spot {
  id: string; // Changed to string
  name: string;
  destination: string;
  description: string;
  image: string;
  category: string;
}

export interface ExploreData {
  destinations: Destination[];
  routes: Route[];
  spots: Spot[];
}

export type FavoriteItemType = 'destination' | 'spot' | 'route';

export interface FavoriteItemIdentifier {
  item_id: string;
  item_type: FavoriteItemType;
}

export interface SearchableDestination {
  city: string;
  country: string;
}

export const searchDestinations = async (query: string): Promise<SearchableDestination[]> => {
  if (!query) {
    return [];
  }
  try {
    // We need to specify the full URL to the backend running on a different port
    const response = await fetch(`http://127.0.0.1:8000/api/data/search/destinations?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
    return [];
  }
};


// --- MOCK DATABASE ---

const destinations: Destination[] = [
  { id: 'dest_1', name: 'Beijing', description: 'Historic capital with ancient architecture and modern culture', image: '/placeholder.svg', highlights: ['Forbidden City', 'Great Wall', 'Temple of Heaven'] },
  { id: 'dest_2', name: "Xi'an", description: 'Ancient capital famous for Terracotta Warriors', image: '/placeholder.svg', highlights: ['Terracotta Army', 'City Wall', 'Muslim Quarter'] },
  { id: 'dest_3', name: 'Shanghai', description: 'Modern metropolis blending East and West', image: '/placeholder.svg', highlights: ['The Bund', 'Yu Garden', 'Oriental Pearl Tower'] },
  { id: 'dest_4', name: 'Chengdu', description: 'Home of giant pandas and spicy Sichuan cuisine', image: '/placeholder.svg', highlights: ['Panda Base', 'Jinli Street', 'Wenshu Monastery'] },
  { id: 'dest_5', name: 'Guilin', description: 'Famous for its karst landscape and picturesque Li River', image: '/placeholder.svg', highlights: ['Li River Cruise', 'Yangshuo', 'Reed Flute Cave'] },
];

const routes: Route[] = [
  { id: 'route_1', name: 'Classic China Discovery', startCity: 'Beijing', endCity: 'Shanghai', days: 7, tags: ['7-day', 'Cultural', 'Historic'], description: "Experience China's imperial past and vibrant present" },
  { id: 'route_2', name: 'Family Adventure Tour', startCity: 'Beijing', endCity: "Xi'an", days: 5, tags: ['5-day', 'Family Friendly', 'Educational'], description: 'Perfect introduction to Chinese history for families' },
  { id: 'route_3', name: 'City Explorer Route', startCity: 'Shanghai', endCity: 'Suzhou', days: 3, tags: ['3-day', 'Urban', 'Modern'], description: 'Modern cities and traditional gardens' },
];

const spots: Spot[] = [
  { id: 'spot_1', name: 'Forbidden City', destination: 'Beijing', description: 'Imperial palace complex with 600 years of history', image: '/placeholder.svg', category: 'Historic' },
  { id: 'spot_2', name: 'Terracotta Warriors', destination: "Xi'an", description: 'Ancient army of clay soldiers guarding an emperor', image: '/placeholder.svg', category: 'Archaeological' },
  { id: 'spot_3', name: 'The Bund', destination: 'Shanghai', description: 'Iconic waterfront with colonial architecture', image: '/placeholder.svg', category: 'Architecture' },
  { id: 'spot_4', name: 'Chengdu Panda Base', destination: 'Chengdu', description: 'Research and breeding center for giant pandas', image: '/placeholder.svg', category: 'Wildlife' },
];

// This acts as our mock database table for user_favorites
let mockFavoritesDB: FavoriteItemIdentifier[] = [
  { item_id: 'dest_1', item_type: 'destination' },
  { item_id: 'route_2', item_type: 'route' },
  { item_id: 'spot_4', item_type: 'spot' },
];

// --- MOCK API FUNCTIONS ---

const simulateNetwork = (delay: number = 500) => new Promise(resolve => setTimeout(resolve, delay));

export const fetchExploreData = async (): Promise<ExploreData> => {
  await simulateNetwork();
  return { destinations, routes, spots };
};

export const getFavorites = async (): Promise<FavoriteItemIdentifier[]> => {
  await simulateNetwork(200);
  return [...mockFavoritesDB]; // Return a copy
};

export const addFavorite = async (item_id: string, item_type: FavoriteItemType): Promise<FavoriteItemIdentifier> => {
  await simulateNetwork(300);
  const newItem = { item_id, item_type };
  
  const exists = mockFavoritesDB.some(fav => fav.item_id === item_id && fav.item_type === item_type);
  if (exists) {
    // In a real API, this would throw a 409 Conflict error
    console.warn("Item already in favorites");
    return newItem;
  }

  mockFavoritesDB.push(newItem);
  return newItem;
};

export const removeFavorite = async (item_id: string, item_type: FavoriteItemType): Promise<void> => {
  await simulateNetwork(300);
  mockFavoritesDB = mockFavoritesDB.filter(fav => !(fav.item_id === item_id && fav.item_type === item_type));
};

// Function to get full details of favorited items
export const getMyFavoritesDetails = async () => {
    await simulateNetwork();
    const currentFavorites = await getFavorites();
    
    const allItems = [...destinations, ...routes, ...spots];

    const favoriteDetails = currentFavorites.map(fav => {
        const item = allItems.find(i => i.id === fav.item_id);
        return { ...item, item_type: fav.item_type };
    });

    return favoriteDetails.filter(Boolean) as (Destination | Route | Spot & { item_type: FavoriteItemType })[];
};