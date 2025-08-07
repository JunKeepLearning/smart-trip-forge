import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Building2, ArrowRight, Calendar } from 'lucide-react';
import TheHeader from '@/components/TheHeader';
import TheFooter from '@/components/TheFooter';
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

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'destination' | 'route' | 'spot'>('destination');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const destinations = [
    {
      id: 1,
      name: 'Beijing',
      description: 'Historic capital with ancient architecture and modern culture',
      image: '/placeholder.svg',
      highlights: ['Forbidden City', 'Great Wall', 'Temple of Heaven']
    },
    {
      id: 2,
      name: "Xi'an",
      description: 'Ancient capital famous for Terracotta Warriors',
      image: '/placeholder.svg',
      highlights: ['Terracotta Army', 'City Wall', 'Muslim Quarter']
    },
    {
      id: 3,
      name: 'Shanghai',
      description: 'Modern metropolis blending East and West',
      image: '/placeholder.svg',
      highlights: ['The Bund', 'Yu Garden', 'Oriental Pearl Tower']
    }
  ];

  const routes = [
    {
      id: 1,
      name: 'Classic China Discovery',
      startCity: 'Beijing',
      endCity: 'Shanghai',
      days: 7,
      tags: ['7-day', 'Cultural', 'Historic'],
      description: 'Experience China\'s imperial past and vibrant present'
    },
    {
      id: 2,
      name: 'Family Adventure Tour',
      startCity: 'Beijing',
      endCity: "Xi'an",
      days: 5,
      tags: ['5-day', 'Family Friendly', 'Educational'],
      description: 'Perfect introduction to Chinese history for families'
    },
    {
      id: 3,
      name: 'City Explorer Route',
      startCity: 'Shanghai',
      endCity: 'Suzhou',
      days: 3,
      tags: ['3-day', 'Urban', 'Modern'],
      description: 'Modern cities and traditional gardens'
    }
  ];

  const spots = [
    {
      id: 1,
      name: 'Forbidden City',
      destination: 'Beijing',
      description: 'Imperial palace complex with 600 years of history',
      image: '/placeholder.svg',
      category: 'Historic'
    },
    {
      id: 2,
      name: 'Terracotta Warriors',
      destination: "Xi'an",
      description: 'Ancient army of clay soldiers guarding an emperor',
      image: '/placeholder.svg',
      category: 'Archaeological'
    },
    {
      id: 3,
      name: 'The Bund',
      destination: 'Shanghai',
      description: 'Iconic waterfront with colonial architecture',
      image: '/placeholder.svg',
      category: 'Architecture'
    }
  ];

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.startCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.endCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSpots = spots.filter(spot =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = filteredDestinations.length > 0 || filteredRoutes.length > 0 || filteredSpots.length > 0;
  const isSearching = searchQuery.length > 0;

  const handleCardClick = (item: any, type: 'destination' | 'route' | 'spot') => {
    setSelectedItem(item);
    setSelectedType(type);
    setIsDrawerOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <TheHeader />
      
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      <div className="container mx-auto px-4 py-8">
        {isSearching && !hasResults && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-2">No results found</div>
            <div className="text-muted-foreground">Try adjusting your search terms</div>
          </div>
        )}

        {(!isSearching || hasResults) && (
          <div className="space-y-12">
            {/* Destinations Section */}
            {(!isSearching || filteredDestinations.length > 0) && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    {isSearching ? 'Destinations' : 'Popular Destinations'}
                  </h2>
                </div>
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {(isSearching ? filteredDestinations : destinations.slice(0, 6)).map((destination) => (
                      <CarouselItem key={destination.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <TravelCard 
                          item={destination} 
                          type="destination" 
                          searchQuery={searchQuery} 
                          onClick={handleCardClick}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                {!isSearching && (
                  <div className="text-right mt-4">
                    <Button variant="link" onClick={() => alert('Navigate to all destinations page')}>
                      View All Destinations <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </section>
            )}

            {/* Spots Section */}
            {(!isSearching || filteredSpots.length > 0) && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    {isSearching ? 'Spots' : 'Featured Spots'}
                  </h2>
                </div>
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {(isSearching ? filteredSpots : spots.slice(0, 6)).map((spot) => (
                      <CarouselItem key={spot.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <TravelCard 
                          item={spot} 
                          type="spot" 
                          searchQuery={searchQuery} 
                          onClick={handleCardClick}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                {!isSearching && (
                  <div className="text-right mt-4">
                    <Button variant="link" onClick={() => alert('Navigate to all spots page')}>
                      View All Spots <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </section>
            )}

            {/* Routes Section */}
            {(!isSearching || filteredRoutes.length > 0) && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Route className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    {isSearching ? 'Routes' : 'Recommended Routes'}
                  </h2>
                </div>
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {(isSearching ? filteredRoutes : routes.slice(0, 6)).map((route) => (
                      <CarouselItem key={route.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <TravelCard 
                          item={route} 
                          type="route" 
                          searchQuery={searchQuery} 
                          onClick={handleCardClick}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                {!isSearching && (
                  <div className="text-right mt-4">
                    <Button variant="link" onClick={() => alert('Navigate to all routes page')}>
                      View All Routes <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>

      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedItem}
        type={selectedType}
      />
      <TheFooter />
    </div>
  );
};

export default Explore;