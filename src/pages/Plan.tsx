import { useState } from "react";
import { Search, PlusCircle, Calendar, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TheHeader from "@/components/TheHeader";
import TheFooter from "@/components/TheFooter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TripForm, TripFormValues } from "@/components/TripForm";
import { CreateTripForm } from "@/components/CreateTripForm";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { z } from "zod";

// Type definitions
interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // Stored as ISO string yyyy-MM-dd
  endDate: string;   // Stored as ISO string yyyy-MM-dd
  description: string;
  status: "Not Started" | "In Progress" | "Completed";
  thumbnail?: string;
  createdAt: string; // Stored as ISO string yyyy-MM-dd
}

const createTripFormSchema = z.object({
  destination: z.string().min(2, { message: "Destination is required." }),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
});

type CreateTripFormValues = z.infer<typeof createTripFormSchema>;

// Mock Data
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
  // State management
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  // Derived state
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function
  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "Not Started": return "bg-gray-100 text-gray-700 border-gray-200";
      case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Event Handlers
  const handleCreateTrip = () => {
    setCreateDialogOpen(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setDrawerOpen(true);
  };

  const handleDeleteRequest = (tripId: string) => {
    setDeletingTripId(tripId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingTripId) {
      setTrips(trips.filter(trip => trip.id !== deletingTripId));
      setDeleteDialogOpen(false);
      setDeletingTripId(null);
    }
  };

  const handleSaveTrip = (values: TripFormValues) => {
    if (editingTrip) {
      setTrips(trips.map(trip => 
        trip.id === editingTrip.id ? { 
          ...trip, 
          ...values, 
          startDate: format(values.startDate, 'yyyy-MM-dd'), 
          endDate: format(values.endDate, 'yyyy-MM-dd') 
        } : trip
      ));
    } 
    setDrawerOpen(false);
    setEditingTrip(null);
  };
  
  const handleSelfPlan = (values: CreateTripFormValues) => {
    const newTrip: Trip = {
      id: Date.now().toString(),
      name: `Trip to ${values.destination}`,
      destination: values.destination,
      startDate: format(values.startDate, 'yyyy-MM-d'),
      endDate: format(values.endDate, 'yyyy-MM-dd'),
      description: "",
      status: "Not Started",
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };
    setTrips([newTrip, ...trips]);
    setCreateDialogOpen(false);
    // Open the drawer to edit the newly created trip
    setEditingTrip(newTrip);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TheHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Plan Your Journey</h1>
          <p className="text-muted-foreground">Create and manage your travel adventures</p>
        </div>

        <Card onClick={handleCreateTrip} className="mb-8 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer group">
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

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-semibold text-foreground">My Trips</h2>
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

          {filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-6 rounded-full bg-muted/30 inline-block mb-4">
                <MapPin className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery || statusFilter !== "All" ? "No trips match your criteria" : "No trips created yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "All" ? "Try adjusting your search or filter settings" : "Click the button above to start planning your first adventure!"}
              </p>
              <Button onClick={handleCreateTrip}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Trip
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{trip.name}</CardTitle>
                      <Badge variant="outline" className={getStatusColor(trip.status)}>{trip.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground"><MapPin className="h-4 w-4 mr-2" />{trip.destination}</div>
                      <div className="flex items-center text-sm text-muted-foreground"><Calendar className="h-4 w-4 mr-2" />{trip.startDate} - {trip.endDate}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground truncate">{trip.description || "No description."}</p>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditTrip(trip)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditTrip(trip)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(trip.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/plan/${trip.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <TheFooter />

      {/* Create Trip Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Trip</DialogTitle>
            <DialogDescription>Provide some basic details to begin planning.</DialogDescription>
          </DialogHeader>
          <CreateTripForm onSubmit={handleSelfPlan} />
        </DialogContent>
      </Dialog>

      {/* Edit/View Trip Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{editingTrip?.name || "Plan Your Trip"}</DrawerTitle>
            <DrawerDescription>Edit the details of your adventure.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto">
            {editingTrip && (
              <TripForm 
                onSubmit={handleSaveTrip}
                initialValues={{
                  ...editingTrip,
                  startDate: parseISO(editingTrip.startDate),
                  endDate: parseISO(editingTrip.endDate),
                }}
                onCancel={() => setDrawerOpen(false)}
              />
            )}
          </div>
          <DrawerFooter />
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your trip.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Plan;