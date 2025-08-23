import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Building2, Calendar } from 'lucide-react';
import { Destination, Spot, Route as RouteType } from '@/lib/api';

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

const TravelCard: React.FC<TravelCardProps> = (props) => {
  const { type, item, searchQuery } = props;

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

  const renderContent = () => {
    switch (type) {
      case 'destination':
        return (
          <>
            <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <CardHeader className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-purple-800" />
                <Badge variant="outline" className="text-xs border-purple-800 text-purple-800">
                  Destination
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {highlightMatch(item.name, searchQuery)}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {highlightMatch(item.description, searchQuery)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 mb-4">
                {item.highlights.map((highlight: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </>
        );
      case 'spot':
        return (
          <>
            <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <CardHeader className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-purple-800" />
                <Badge variant="outline" className="text-xs border-purple-800 text-purple-800">
                  Spot
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {highlightMatch(item.name, searchQuery)}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{item.destination}</span>
              </div>
              <CardDescription className="text-sm text-gray-600">
                {highlightMatch(item.description, searchQuery)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            </CardContent>
          </>
        );
      case 'route':
        return (
          <>
            <CardHeader>
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
            <CardContent className="space-y-4 flex-grow">
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
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-200 rounded-xl flex flex-col h-full"
      onClick={handleClick}
    >
      {renderContent()}
    </Card>
  );
};

export default TravelCard;