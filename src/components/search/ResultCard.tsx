import React from 'react';
import Highlighter from './Highlighter';
import { Destination, Route, Spot } from '@/lib/api';
import { MapPin, Calendar, Star } from 'lucide-react';

type ResultCardProps = {
  item: Destination | Route | Spot;
  highlight: string;
  onClick: () => void;
};

const ResultCard = ({ item, highlight, onClick }: ResultCardProps) => {
  const getItemDetails = () => {
    if ('startCity' in item) { // Route
      return <><Calendar className="w-3 h-3 mr-1" /> {item.days} days</>;
    }
    if ('category' in item) { // Spot
      return <><MapPin className="w-3 h-3 mr-1" /> {item.destination}</>;
    }
    // @ts-ignore
    return <><Star className="w-3 h-3 mr-1" /> {item.highlights.length} Highlights</>;
  };

  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
    >
      <img
        // @ts-ignore
        src={item.image || '/placeholder.svg'}
        alt={item.name}
        className="w-16 h-16 rounded-md object-cover mr-4"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-base mb-1">
          <Highlighter text={item.name} highlight={highlight} />
        </h3>
        <p className="text-sm text-muted-foreground flex items-center">
          {getItemDetails()}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;