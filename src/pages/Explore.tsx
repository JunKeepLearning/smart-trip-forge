import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Building2, ArrowRight, Calendar } from 'lucide-react';
import TheHeader from '@/components/TheHeader';
import TheFooter from '@/components/TheFooter';
import SearchBar from '@/components/SearchBar';
import DetailDrawer from '@/components/DetailDrawer';

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(isSearching ? filteredDestinations : destinations).map((destination) => (
                    <Card 
                      key={destination.id} 
                      className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-200 rounded-xl flex flex-col"
                      onClick={() => handleCardClick(destination, 'destination')}
                    >
                      <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
                        <img 
                          src={destination.image} 
                          alt={destination.name}
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
                          {highlightMatch(destination.name, searchQuery)}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {highlightMatch(destination.description, searchQuery)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {destination.highlights.map((highlight, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                        <Button className="w-full group/btn bg-purple-800 hover:bg-purple-700">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(isSearching ? filteredRoutes : routes).map((route) => (
                    <Card 
                      key={route.id} 
                      className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-200 rounded-xl flex flex-col"
                      onClick={() => handleCardClick(route, 'route')}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Route className="w-4 h-4 text-purple-800" />
                          <Badge variant="outline" className="text-xs border-purple-800 text-purple-800">
                            Route
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {highlightMatch(route.name, searchQuery)}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {highlightMatch(route.description, searchQuery)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{route.startCity} → {route.endCity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{route.days} days</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {route.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs rounded-full px-3 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <div className="p-6 pt-0">
                        <Button className="w-full group/btn bg-purple-800 hover:bg-purple-700">
                          Start AI Planning
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(isSearching ? filteredSpots : spots).map((spot) => (
                    <Card 
                      key={spot.id} 
                      className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-200 rounded-xl flex flex-col"
                      onClick={() => handleCardClick(spot, 'spot')}
                    >
                      <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
                        <img 
                          src={spot.image} 
                          alt={spot.name}
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
                          {highlightMatch(spot.name, searchQuery)}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{spot.destination}</span>
                        </div>
                        <CardDescription className="text-sm text-gray-600">
                          {highlightMatch(spot.description, searchQuery)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {spot.category}
                          </Badge>
                          <Button size="sm" className="group/btn bg-purple-800 hover:bg-purple-700">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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