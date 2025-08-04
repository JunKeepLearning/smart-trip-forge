import { useState } from "react";
import { Search, PlusCircle, Calendar, MapPin, Edit, Trash2, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TheHeader from "@/components/TheHeader";

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  status: "Not Started" | "In Progress" | "Completed";
  thumbnail?: string;
  createdAt: string;
}

const mockTrips: Trip[] = [
  {
    id: "1",
    name: "Beijing Cultural Journey",
    destination: "Beijing, China",
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    description: "5-day exploration of historic Beijing",
    status: "In Progress",
    createdAt: "2024-02-10"
  },
  {
    id: "2",
    name: "Shanghai Modern Adventure",
    destination: "Shanghai, China",
    startDate: "2024-04-10",
    endDate: "2024-04-14",
    description: "4-day modern city experience",
    status: "Not Started",
    createdAt: "2024-02-15"
  },
  {
    id: "3",
    name: "Xi'an Ancient Discovery",
    destination: "Xi'an, China",
    startDate: "2024-01-20",
    endDate: "2024-01-24",
    description: "Historical sites and terracotta warriors",
    status: "Completed",
    createdAt: "2024-01-05"
  }
];

const Plan = () => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    setTrips(trips.filter(trip => trip.id !== tripId));
  };

  return (
    <div className="min-h-screen bg-background">
      <TheHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Plan Your Journey</h1>
          <p className="text-muted-foreground">Create and manage your travel adventures</p>
        </div>

        {/* Create Trip Entry Box */}
        <Card className="mb-8 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer group">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <PlusCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Start Planning Your Next Adventure</h3>
                <p className="text-muted-foreground mb-4">Click here to create a new trip and begin your personalized journey planning experience</p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create New Trip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Trips Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-foreground">My Trips</h2>
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Trip
              </Button>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
              >
                <option value="All">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Trips Grid */}
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-6 rounded-full bg-muted/30 inline-block mb-4">
                <MapPin className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery || statusFilter !== "All" 
                  ? "No trips match your criteria" 
                  : "No trips created yet"
                }
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "All"
                  ? "Try adjusting your search or filter settings"
                  : "You haven't created any trips yet. Click the button above to start planning your first adventure!"
                }
              </p>
              {(!searchQuery && statusFilter === "All") && (
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Trip
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {trip.name}
                      </CardTitle>
                      <Badge variant="outline" className={getStatusColor(trip.status)}>
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {trip.destination}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {trip.startDate} - {trip.endDate}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{trip.description}</p>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Plan;