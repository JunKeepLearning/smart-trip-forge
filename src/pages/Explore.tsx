import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, MapPin, Route, Building2, ArrowRight, Calendar, Users } from 'lucide-react';
import TheHeader from '@/components/TheHeader';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="min-h-screen bg-background">
      <TheHeader />
      
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search destinations, spots or routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

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
                    <Card key={destination.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                        <img 
                          src={destination.image} 
                          alt={destination.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl">{destination.name}</CardTitle>
                        <CardDescription>{destination.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {destination.highlights.map((highlight, index) => (
                            <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                              {highlight}
                            </span>
                          ))}
                        </div>
                        <Button className="w-full group/btn">
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
                    <Card key={route.id} className="group hover:shadow-lg transition-all duration-200">
                      <CardHeader>
                        <CardTitle className="text-xl">{route.name}</CardTitle>
                        <CardDescription>{route.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{route.startCity} → {route.endCity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{route.days} days</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {route.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button className="w-full group/btn">
                          Start AI Planning
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
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
                    <Card key={spot.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                        <img 
                          src={spot.image} 
                          alt={spot.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl">{spot.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{spot.destination}</span>
                        </div>
                        <CardDescription>{spot.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                            {spot.category}
                          </span>
                          <Button size="sm" className="group/btn">
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
    </div>
  );
};

export default Explore;