import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  getFavorites as apiGetFavorites,
  addFavorite as apiAddFavorite,
  removeFavorite as apiRemoveFavorite,
  FavoriteItemIdentifier,
  FavoriteItemType
} from '@/lib/api';

// Define the shape of the context
interface FavoritesContextType {
  favorites: FavoriteItemIdentifier[];
  loading: boolean;
  isFavorited: (itemId: string, itemType: FavoriteItemType) => boolean;
  addFavorite: (itemId: string, itemType: FavoriteItemType) => Promise<void>;
  removeFavorite: (itemId: string, itemType: FavoriteItemType) => Promise<void>;
}

// Create the context with a default undefined value
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Create the provider component
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItemIdentifier[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial favorites when the provider mounts
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        const favs = await apiGetFavorites();
        setFavorites(favs);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const isFavorited = useCallback((itemId: string, itemType: FavoriteItemType) => {
    return favorites.some(fav => fav.item_id === itemId && fav.item_type === itemType);
  }, [favorites]);

  const addFavorite = async (itemId: string, itemType: FavoriteItemType) => {
    const newItem = { item_id: itemId, item_type: itemType };
    
    // Optimistic update for a better user experience
    setFavorites(prev => [...prev, newItem]);

    try {
      await apiAddFavorite(itemId, itemType);
    } catch (error) {
      console.error("Failed to add favorite:", error);
      // Revert the change if the API call fails
      setFavorites(prev => prev.filter(fav => !(fav.item_id === itemId && fav.item_type === itemType)));
    }
  };

  const removeFavorite = async (itemId: string, itemType: FavoriteItemType) => {
    // Optimistic update
    setFavorites(prev => prev.filter(fav => !(fav.item_id === itemId && fav.item_type === itemType)));

    try {
      await apiRemoveFavorite(itemId, itemType);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      // Revert the change if the API call fails
      const revertedItem = { item_id: itemId, item_type: itemType };
      setFavorites(prev => [...prev, revertedItem]);
    }
  };

  const value = {
    favorites,
    loading,
    isFavorited,
    addFavorite,
    removeFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Create a custom hook for easy consumption of the context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
