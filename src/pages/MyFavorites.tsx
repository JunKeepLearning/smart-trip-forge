import React from 'react';
import { useFavoritesDetails } from '@/hooks/api/useFavorites';
import type { Destination, Spot, Route as RouteType, FavoriteItemType } from '@/types';
import TravelCard from '@/components/TravelCard';
import { useUIStore } from '@/stores/ui';
import DetailDrawer from '@/components/DetailDrawer';
import { Star, Loader2 } from 'lucide-react';

// A type guard to help TypeScript identify the item type
const isDestination = (item: any): item is Destination & { item_type: 'destination' } => item.item_type === 'destination';
const isSpot = (item: any): item is Spot & { item_type: 'spot' } => item.item_type === 'spot';
const isRoute = (item: any): item is RouteType & { item_type: 'route' } => item.item_type === 'route';

type FavoritedItem = (Destination | Spot | RouteType) & { item_type: FavoriteItemType };

const MyFavorites = () => {
  const { data: favorites, isLoading, isError } = useFavoritesDetails();
  const { openDrawer } = useUIStore();

  const handleCardClick = (item: Destination | Spot | RouteType, type: 'destination' | 'route' | 'spot') => {
    openDrawer(item, type);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading favorites...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Favorites</h2>
        <p className="mt-2">Please try again later.</p>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Star className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-2xl font-bold">No Favorites Yet</h2>
        <p className="mt-2 text-gray-500">Your favorited items will appear here. Start exploring to find what you love!</p>
      </div>
    );
  }

  const destinations = favorites.filter(isDestination);
  const spots = favorites.filter(isSpot);
  const routes = favorites.filter(isRoute);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      
      {destinations.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Destinations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {destinations.map(item => (
              <TravelCard key={item.id} item={item} type="destination" searchQuery="" onClick={handleCardClick} />
            ))}
          </div>
        </section>
      )}

      {spots.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Spots</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {spots.map(item => (
              <TravelCard key={item.id} item={item} type="spot" searchQuery="" onClick={handleCardClick} />
            ))}
          </div>
        </section>
      )}

      {routes.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {routes.map(item => (
              <TravelCard key={item.id} item={item} type="route" searchQuery="" onClick={handleCardClick} />
            ))}
          </div>
        </section>
      )}

      <DetailDrawer />
    </div>
  );
};

export default MyFavorites;
