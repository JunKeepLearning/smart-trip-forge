import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Building2, Calendar, Star, Loader2 } from 'lucide-react';
import type { Destination, Spot, Route as RouteType, FavoriteItemType } from '@/types';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '@/hooks/api/useFavorites';

// Define props for each card type using a discriminated union
type TravelCardBaseProps = {
  searchQuery: string;
};

type DestinationCardProps = TravelCardBaseProps & {
  type: 'destination';
  item: Destination;
  onClick: (item: Destination, type: 'destination') => void;
};

type SpotCardProps = TravelCardBaseProps & {
  type: 'spot';
  item: Spot;
  onClick: (item: Spot, type: 'spot') => void;
};

type RouteCardProps = TravelCardBaseProps & {
  type: 'route';
  item: RouteType;
  onClick: (item: RouteType, type: 'route') => void;
};

// The final props type is a union of all possible card types
type TravelCardProps = DestinationCardProps | SpotCardProps | RouteCardProps;

const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) => 
    regex.test(part) ? (
      <span key={index} className="text-purple-800 font-semibold">{part}</span>
    ) : part
  );
};

// Favorite Button Component (Refactored with React Query)
const FavoriteButton = ({ item_id, item_type }: { item_id: string, item_type: FavoriteItemType }) => {
  const { data: favoritesList } = useFavorites();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const favorited = useMemo(() => 
    favoritesList?.some(fav => fav.item_id === item_id && fav.item_type === item_type) || false,
    [favoritesList, item_id, item_type]
  );

  const isMutating = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMutating) return;

    if (favorited) {
      removeFavoriteMutation.mutate({ itemId: item_id, itemType: item_type });
    } else {
      addFavoriteMutation.mutate({ itemId: item_id, itemType: item_type });
    }
  };

  return (
    <button
      onClick={handleFavoriteClick}
      disabled={isMutating}
      className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors z-10"
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isMutating ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Star className={`w-5 h-5 transition-all ${favorited ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent'}`} />
      )}
    </button>
  );
};

const TravelCard: React.FC<TravelCardProps> = (props) => {
  const { type, item, searchQuery } = props;

  const renderContent = () => {
    switch (type) {
      case 'destination':
        return (
          <>
            <div className="aspect-w-3 aspect-h-2 bg-gray-100 rounded-t-xl overflow-hidden relative">
              <FavoriteButton item_id={item.id} item_type={type} />
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="text-xs bg-white/90 text-purple-800 border-purple-800 backdrop-blur-sm">
                  <MapPin className="w-3 h-3 mr-1.5" />
                  Destination
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <CardTitle className="text-lg font-bold text-white">
                  {highlightMatch(item.name, searchQuery)}
                </CardTitle>
              </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
              <CardDescription className="text-sm text-gray-600 mb-3 flex-grow">
                {highlightMatch(item.description, searchQuery)}
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                {item.highlights.map((highlight: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        );
      case 'spot':
        return (
          <>
            <div className="aspect-w-3 aspect-h-2 bg-gray-100 rounded-t-xl overflow-hidden relative">
              <FavoriteButton item_id={item.id} item_type={type} />
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="text-xs bg-white/90 text-purple-800 border-purple-800 backdrop-blur-sm">
                  <Building2 className="w-3 h-3 mr-1.5" />
                  Spot
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <CardTitle className="text-lg font-bold text-white">
                  {highlightMatch(item.name, searchQuery)}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-200 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{item.destination}</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
              <CardDescription className="text-sm text-gray-600 mb-3 flex-grow">
                {highlightMatch(item.description, searchQuery)}
              </CardDescription>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            </div>
          </>
        );
      case 'route':
        return (
          <>
            <FavoriteButton item_id={item.id} item_type={type} />
            <CardHeader className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-4 h-4 text-purple-800" />
                <Badge variant="outline" className="text-xs border-purple-800 text-purple-800">
                  Route
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {highlightMatch(item.name, searchQuery)}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {highlightMatch(item.description, searchQuery)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 flex-grow px-4 pb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {item.startCity} → {item.endCity}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{item.days} days</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs rounded-full px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  const handleClick = () => {
    switch (props.type) {
      case 'destination':
        props.onClick(props.item, 'destination');
        break;
      case 'spot':
        props.onClick(props.item, 'spot');
        break;
      case 'route':
        props.onClick(props.item, 'route');
        break;
    }
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-200 rounded-xl flex flex-col h-full relative"
      onClick={handleClick}
    >
      {renderContent()}
    </Card>
  );
};

export default TravelCard;
