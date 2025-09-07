import React, { useState, useMemo } from 'react';
import { useUIStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Route, Building2, ArrowRight, AlertCircle, Info } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import DetailDrawer from '@/components/DetailDrawer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import TravelCard from '@/components/TravelCard';
import TravelCardSkeleton from '@/components/TravelCardSkeleton';
import { useExploreData } from '@/hooks/useExploreData';
import { Destination, Spot, Route as RouteType } from '@/lib/api';
import { useNavigate, Link } from 'react-router-dom';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { openDrawer } = useUIStore();
  const navigate = useNavigate();

  const { data, loading, error } = useExploreData();

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return { destinations: [], routes: [], spots: [] };

    const query = searchQuery.toLowerCase();
    if (!query) {
      return {
        destinations: data.destinations,
        routes: data.routes,
        spots: data.spots,
      };
    }

    const destinations = data.destinations.filter(dest =>
      dest.name.toLowerCase().includes(query) ||
      dest.description.toLowerCase().includes(query)
    );

    const routes = data.routes.filter(route =>
      route.name.toLowerCase().includes(query) ||
      route.startCity.toLowerCase().includes(query) ||
      route.endCity.toLowerCase().includes(query) ||
      route.tags.some(tag => tag.toLowerCase().includes(query))
    );

    const spots = data.spots.filter(spot =>
      spot.name.toLowerCase().includes(query) ||
      spot.destination.toLowerCase().includes(query) ||
      spot.description.toLowerCase().includes(query)
    );

    return { destinations, routes, spots };
  }, [data, searchQuery]);

  const handleCardClick = (item: Destination | Spot | RouteType, type: 'destination' | 'route' | 'spot') => {
    openDrawer(item, type);
  };

  const isSearching = searchQuery.length > 0;
  const hasResults = filteredData.destinations.length > 0 || filteredData.routes.length > 0 || filteredData.spots.length > 0;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-12">
          {[
            { title: 'Popular Destinations', icon: MapPin },
            { title: 'Featured Spots', icon: Building2 },
            { title: 'Recommended Routes', icon: Route },
          ].map((section, index) => (
            <section key={index}>
              <div className="flex items-center gap-3 mb-6">
                <section.icon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
              </div>
              <div className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 flex-shrink-0">
                      <TravelCardSkeleton />
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-destructive">
          <AlertCircle className="mx-auto h-12 w-12" />
          <h3 className="mt-2 text-lg font-medium">Failed to load data</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      );
    }

    if (isSearching && !hasResults) {
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">No results found</div>
          <div className="text-muted-foreground">Try adjusting your search terms</div>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {!isSearching && (
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-6 flex items-center gap-4 sm:gap-6">
              <div className="hidden sm:block p-3 border border-primary/20 rounded-full bg-background">
                <Info className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-foreground">First time in China?</h3>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Check out our essential guide for tips on VPNs, payments, and more.
                </p>
              </div>
              <Button asChild className="ml-auto flex-shrink-0">
                <Link to="/guides/first-time-china">View Guide</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {filteredData.destinations.length > 0 && (
          <ContentSection
            title={isSearching ? 'Destinations' : 'Popular Destinations'}
            Icon={MapPin}
            items={filteredData.destinations}
            type="destination"
            searchQuery={searchQuery}
            onCardClick={handleCardClick}
            showViewAll={!isSearching}
          />
        )}
        {filteredData.spots.length > 0 && (
          <ContentSection
            title={isSearching ? 'Spots' : 'Featured Spots'}
            Icon={Building2}
            items={filteredData.spots}
            type="spot"
            searchQuery={searchQuery}
            onCardClick={handleCardClick}
            showViewAll={!isSearching}
          />
        )}
        {filteredData.routes.length > 0 && (
          <ContentSection
            title={isSearching ? 'Routes' : 'Recommended Routes'}
            Icon={Route}
            items={filteredData.routes}
            type="route"
            searchQuery={searchQuery}
            onCardClick={handleCardClick}
            showViewAll={!isSearching}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>

      <DetailDrawer />
    </>
  );
};

type ContentSectionProps = {
  title: string;
  Icon: React.ElementType;
  searchQuery: string;
  showViewAll: boolean;
} & (
  | {
      type: 'destination';
      items: Destination[];
      onCardClick: (item: Destination | Spot | RouteType, type: 'destination' | 'route' | 'spot') => void;
    }
  | {
      type: 'route';
      items: RouteType[];
      onCardClick: (item: Destination | Spot | RouteType, type: 'destination' | 'route' | 'spot') => void;
    }
  | {
      type: 'spot';
      items: Spot[];
      onCardClick: (item: Destination | Spot | RouteType, type: 'destination' | 'route' | 'spot') => void;
    }
);

function ContentSection(props: ContentSectionProps) {
  const { title, Icon, items, type, searchQuery, onCardClick, showViewAll } = props;
  const navigate = useNavigate();

  return (
      <section>
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              </div>
              {showViewAll && (
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/search?type=${type}`)}>
                      View More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
              )}
          </div>
        <Carousel opts={{ align: "start" }} className="w-full -ml-4">
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-4 basis-2/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <TravelCard
                  item={item}
                  type={type as 'destination' | 'spot' | 'route'}
                  searchQuery={searchQuery}
                  onClick={onCardClick as any}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-14" />
          <CarouselNext className="mr-8" />
        </Carousel>
      </section>
  );
}

export default Explore;