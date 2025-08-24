import { useState } from "react";
import { PlusCircle, Calendar, MapPin, UserPlus, Trash2, Users, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CreateTripForm, type CreateTripFormValues } from "@/components/CreateTripForm";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { useTrips, Trip, DayPlan } from "@/contexts/TripsContext";

const Plan = () => {
  // Global state and navigation
  const navigate = useNavigate();
  const { trips, addTrip, deleteTrip } = useTrips();

  // Local UI state
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  // Helper functions
  const calculateDuration = (startDate: string, endDate: string) => {
    const days = differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
    const nights = days > 0 ? days - 1 : 0;
    return { days, nights };
  };

  const calculateLocationCount = (itinerary: DayPlan[] = []) => {
    return itinerary.reduce((acc, day) => acc + day.items.length, 0);
  };

  // Event Handlers
  const handleCreateTrip = () => {
    setCreateDialogOpen(true);
  };

  const handleDeleteRequest = (tripId: string) => {
    setDeletingTripId(tripId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingTripId) {
      deleteTrip(deletingTripId);
      setDeleteDialogOpen(false);
      setDeletingTripId(null);
    }
  };
  
  const handleSelfPlan = (values: CreateTripFormValues) => {
    const newTrip = addTrip({
      name: `Trip to ${values.destination}`,
      destination: values.destination,
      startDate: format(values.startDate, 'yyyy-MM-dd'),
      endDate: format(values.endDate, 'yyyy-MM-dd'),
      description: "",
    });
    setCreateDialogOpen(false);
    navigate(`/plan/${newTrip.id}`);
  };

  return (
    <>
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
          <h2 className="text-2xl font-semibold text-foreground">My Trips</h2>

          {trips.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-6 rounded-full bg-muted/30 inline-block mb-4">
                <MapPin className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No trips created yet</h3>
              <p className="text-muted-foreground mb-6">Click the button above to start planning your first adventure!</p>
              <Button onClick={handleCreateTrip}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Trip
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => {
                const { days, nights } = calculateDuration(trip.startDate, trip.endDate);
                const locationCount = calculateLocationCount(trip.itinerary);
                return (
                  <ContextMenu key={trip.id}>
                    <ContextMenuTrigger>
                      <Card 
                        className="flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer group bg-card h-full"
                        onClick={() => navigate(`/plan/${trip.id}`)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight pr-2">{trip.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                          <div className="flex items-center text-sm text-muted-foreground"><MapPin className="h-4 w-4 mr-2 flex-shrink-0" /><span>{trip.destination}</span></div>
                          <div className="flex items-center text-sm text-muted-foreground space-x-4">
                            <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /><span>{days} Day{days > 1 ? 's' : ''}, {nights} Night{nights > 1 ? 's' : ''}</span></div>
                            <div className="flex items-center"><Landmark className="h-4 w-4 mr-2" /><span>{locationCount} Location{locationCount !== 1 ? 's' : ''}</span></div>
                          </div>
                          <div className="flex items-center pt-2">
                            <div className="flex items-center -space-x-2">
                              <TooltipProvider>
                                {(trip.collaborators || []).slice(0, 3).map(c => (
                                  <Tooltip key={c.id}>
                                    <TooltipTrigger asChild>
                                      <Avatar className="h-8 w-8 border-2 border-card">
                                        <AvatarImage src={c.avatarUrl} alt={c.name} />
                                        <AvatarFallback>{c.name[0]}</AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>{c.name}</TooltipContent>
                                  </Tooltip>
                                ))}
                              </TooltipProvider>
                              {(trip.collaborators?.length || 0) > 3 && (
                                <Avatar className="h-8 w-8 border-2 border-card bg-muted">
                                  <AvatarFallback>+{(trip.collaborators?.length || 0) - 3}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full ml-2" onClick={(e) => { e.stopPropagation(); alert('Add participant feature to be implemented'); }}>
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => alert('Add participant feature to be implemented')}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Add Participant</span>
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleDeleteRequest(trip.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })}
            </div>
          )}
        </div>
      </main>

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
    </>
  );
};

export default Plan;