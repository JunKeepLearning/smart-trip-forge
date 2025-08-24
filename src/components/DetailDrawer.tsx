import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUI } from '@/contexts/UIContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight,
  Building2,
  Route as RouteIcon,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DetailDrawer: React.FC = () => {
  const { drawer, closeDrawer } = useUI();
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const { isOpen, item, type } = drawer;

  if (!isOpen || !item || !type) return null;

  const favorited = isFavorited(item.id, type);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorited) {
      removeFavorite(item.id, type);
    } else {
      addFavorite(item.id, type);
    }
  };

  const renderTitle = (name: string) => (
    <div className="flex items-start justify-between mb-2">
      <h1 className="text-3xl font-bold text-foreground pr-4">{name}</h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleFavoriteClick}
        className="h-10 w-10 rounded-full flex-shrink-0"
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star className={`w-6 h-6 transition-all ${favorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
      </Button>
    </div>
  );

  const renderDestinationContent = () => (
    <div className="space-y-6">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div>
        {renderTitle(item.name)}
        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Popular Spots</h3>
        <div className="grid gap-3">
          {item.highlights?.slice(0, 5).map((highlight: string, index: number) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-foreground">{highlight}</span>
            </div>
          ))}
        </div>
      </div>
      <Button className="w-full" size="lg">
        View Related Routes
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderRouteContent = () => (
    <div className="space-y-6">
      <div>
        {renderTitle(item.name)}
        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Route</span>
          <span className="text-foreground font-medium">{item.startCity} → {item.endCity}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Duration</span>
          <span className="text-foreground font-medium">{item.days} days</span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {item.tags?.map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="border-purple-200 text-purple-800">{tag}</Badge>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Daily Itinerary</h3>
        <div className="space-y-4">
          {Array.from({ length: item.days }, (_, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">{i + 1}</div>
                {i < item.days - 1 && <div className="w-px h-8 bg-border mt-2" />}
              </div>
              <div className="flex-1 pb-4">
                <h4 className="font-medium text-foreground">Day {i + 1}</h4>
                <p className="text-sm text-muted-foreground mt-1">Explore {i === 0 ? item.startCity : i === item.days - 1 ? item.endCity : 'amazing destinations'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button className="w-full" size="lg">
        Use This Route
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderSpotContent = () => (
    <div className="space-y-6">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div>
        {renderTitle(item.name)}
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span>{item.destination}</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
      </div>
      <div>
        <Badge variant="secondary" className="text-sm">{item.category}</Badge>
      </div>
      <div className="grid gap-4">
        <div className="p-4 bg-accent rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Recommended Visit Time</span>
          </div>
          <p className="text-sm text-muted-foreground">2-3 hours</p>
        </div>
        <div className="p-4 bg-accent rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Opening Hours</span>
          </div>
          <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM (Daily)</p>
        </div>
      </div>
      <Button className="w-full" size="lg">
        Add to My Trip
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeDrawer}
      />
      <div
        className={cn(
          "fixed right-0 top-0 h-full bg-background border-l border-border z-50 transition-transform duration-300 ease-in-out",
          "w-full max-w-lg lg:max-w-2xl overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'destination' && <MapPin className="w-5 h-5 text-primary" />}
            {type === 'route' && <RouteIcon className="w-5 h-5 text-primary" />}
            {type === 'spot' && <Building2 className="w-5 h-5 text-primary" />}
            <span className="font-medium text-foreground capitalize">{type} Details</span>
          </div>
          <Button variant="ghost" size="sm" onClick={closeDrawer} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6">
          {type === 'destination' && renderDestinationContent()}
          {type === 'route' && renderRouteContent()}
          {type === 'spot' && renderSpotContent()}
        </div>
      </div>
    </>
  );
};

export default DetailDrawer;