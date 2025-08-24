import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrips, DayPlan, ItineraryItem } from "@/contexts/TripsContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ItineraryItemForm, ItineraryItemFormValues } from "@/components/ItineraryItemForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import TripSettings from '@/components/TripSettings';
import AddCollaboratorDialog from '@/components/AddCollaboratorDialog';
import { PlusCircle, Edit, Trash2, ArrowLeft, Settings, Share2, Calendar, UserPlus, CalendarIcon, ArrowRightLeft, Plus } from "lucide-react";
import { differenceInCalendarDays, format, parseISO, addDays } from "date-fns";

const Itinerary = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getTripById, updateTrip, deleteTrip } = useTrips();

  const trip = useMemo(() => getTripById(tripId || ''), [tripId, getTripById]);

  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [activeAccordion, setActiveAccordion] = useState<string>("overview");
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isDatePopoverOpen, setDatePopoverOpen] = useState(false);
  const [isAddCollaboratorOpen, setAddCollaboratorOpen] = useState(false);
  
  // State for inline date editing
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [duration, setDuration] = useState(1);
  const [dateInputMode, setDateInputMode] = useState<'duration' | 'dates'>('duration');

  // Sync local date state when trip data loads
  useEffect(() => {
    if (trip) {
      const from = parseISO(trip.startDate);
      const to = parseISO(trip.endDate);
      setDateRange({ from, to });
      setDuration(differenceInCalendarDays(to, from) + 1);
    }
  }, [trip]);

  // Effect to sync dates when duration changes
  useEffect(() => {
    if (dateInputMode === 'duration') {
        const startDate = dateRange?.from || new Date();
        setDateRange({ from: startDate, to: addDays(startDate, duration - 1) });
    }
  }, [duration, dateInputMode]);

  // Effect to sync duration when dates change
  useEffect(() => {
    if (dateInputMode === 'dates' && dateRange?.from && dateRange?.to) {
        const newDuration = differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
        if (newDuration > 0) {
            setDuration(newDuration);
        }
    }
  }, [dateRange, dateInputMode]);


  // Regenerate itinerary days when trip dates change
  useEffect(() => {
    if (trip) {
      const startDate = parseISO(trip.startDate);
      const endDate = parseISO(trip.endDate);
      const duration = differenceInCalendarDays(endDate, startDate) + 1;
      
      const newItinerary: DayPlan[] = Array.from({ length: duration }, (_, i) => {
        const dayDate = addDays(startDate, i);
        return {
          id: `day${i + 1}`,
          day: i + 1,
          date: format(dayDate, 'yyyy-MM-dd'),
          title: `Day ${i + 1}`,
          items: [], // Always create empty items for now
        };
      });
      setItinerary(newItinerary);
    }
  }, [trip]);

  const [isItemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ dayId: string; item: ItineraryItem } | null>(null);
  const [addingToDayId, setAddingToDayId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ dayId: string; itemId: string } | null>(null);

  const updateGlobalItinerary = (newItinerary: DayPlan[]) => {
    if (trip) {
      setItinerary(newItinerary);
      updateTrip(trip.id, { itinerary: newItinerary });
    }
  };

  const handleAddItem = (dayId: string) => {
    setAddingToDayId(dayId);
    setEditingItem(null);
    setItemFormOpen(true);
  };

  const handleEditItem = (dayId: string, item: ItineraryItem) => {
    setEditingItem({ dayId, item });
    setAddingToDayId(null);
    setItemFormOpen(true);
  };

  const handleDeleteRequest = (dayId: string, itemId: string) => {
    setDeletingItem({ dayId, itemId });
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    const newItinerary = itinerary.map(day => {
      if (day.id === deletingItem.dayId) {
        return { ...day, items: day.items.filter(item => item.id !== deletingItem.itemId) };
      }
      return day;
    });
    updateGlobalItinerary(newItinerary);
    setDeletingItem(null);
  };

  const handleSaveItem = (values: ItineraryItemFormValues) => {
    let newItinerary: DayPlan[];
    if (editingItem) {
      newItinerary = itinerary.map(day => {
        if (day.id === editingItem.dayId) {
          return { ...day, items: day.items.map(item => item.id === editingItem.item.id ? { ...item, ...values } : item) };
        }
        return day;
      });
    } else if (addingToDayId) {
      const newItem: ItineraryItem = { 
        id: Date.now().toString(), 
        name: values.name,
        time: values.time,
        type: values.type || 'custom',
        notes: values.notes
      };
      newItinerary = itinerary.map(day => {
        if (day.id === addingToDayId) {
          return { ...day, items: [...day.items, newItem] };
        }
        return day;
      });
    } else {
      return;
    }
    updateGlobalItinerary(newItinerary);
    setItemFormOpen(false);
    setEditingItem(null);
    setAddingToDayId(null);
  };

  const handleNavClick = (value: string) => {
    setActiveAccordion(value);
    setTimeout(() => {
      sectionRefs.current[value]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); // Short delay to allow accordion to open
  };

  const handleSaveSettings = (updatedTripData) => {
    if (trip) {
      updateTrip(trip.id, updatedTripData);
      setSettingsOpen(false);
    }
  };

  const handleDeleteTrip = () => {
    if (trip) {
      deleteTrip(trip.id);
      navigate('/plan');
    }
  };

  const handleSaveDates = () => {
    if (trip && dateRange?.from && dateRange?.to) {
      updateTrip(trip.id, {
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
      });
      setDatePopoverOpen(false);
    }
  };

  const handleAddDay = () => {
    if (trip) {
      const newEndDate = addDays(parseISO(trip.endDate), 1);
      updateTrip(trip.id, { endDate: format(newEndDate, 'yyyy-MM-dd') });
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const days = differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
    const nights = days > 0 ? days - 1 : 0;
    return { days, nights };
  };

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Trip not found</h2>
        <p className="text-muted-foreground mt-2">The trip you are looking for does not exist.</p>
        <Button onClick={() => navigate('/plan')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
        </Button>
      </div>
    );
  }

  const { days, nights } = calculateDuration(trip.startDate, trip.endDate);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground">{trip.name}</h1>
                <p className="text-muted-foreground mt-1">{trip.destination}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-4 space-x-4">
                  <Popover open={isDatePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex items-center cursor-pointer">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{days} Day{days > 1 ? 's' : ''}, {nights} Night{nights > 1 ? 's' : ''}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1"><Edit className="h-3 w-3" /></Button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 space-y-4">
                      <div className="flex justify-end">
                        <Button 
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDateInputMode(prev => prev === 'duration' ? 'dates' : 'duration')}
                        >
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          {dateInputMode === 'duration' ? 'Select by Date Range' : 'Select by Duration'}
                        </Button>
                      </div>
                      {dateInputMode === 'duration' ? (
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-center items-center">
                                <span className="text-2xl font-bold w-16 text-center">{duration}</span>
                                <span className="text-muted-foreground">Day{duration > 1 ? 's' : ''}</span>
                            </div>
                            <Slider
                                value={[duration]}
                                onValueChange={(value) => setDuration(value[0])}
                                max={30}
                                min={1}
                                step={1}
                            />
                        </div>
                      ) : (
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      )}
                      <Button onClick={handleSaveDates} className="w-full">Save Dates</Button>
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center">
                    <div className="flex items-center -space-x-2">
                      <TooltipProvider>
                        {(trip.collaborators || []).slice(0, 3).map(c => (
                          <Tooltip key={c.id}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-6 w-6 border-2 border-card">
                                <AvatarImage src={c.avatarUrl} alt={c.name} />
                                <AvatarFallback>{c.name[0]}</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>{c.name}</TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                      {(trip.collaborators?.length || 0) > 3 && (
                        <Avatar className="h-6 w-6 border-2 border-card bg-muted">
                          <AvatarFallback>+{(trip.collaborators?.length || 0) - 3}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full ml-2" onClick={() => setAddCollaboratorOpen(true)}>
                      <UserPlus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4"/></Button>
                <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}><Settings className="h-4 w-4"/></Button>
            </div>
        </div>

        <div className="w-full justify-start overflow-x-auto whitespace-nowrap no-scrollbar border-b mb-4">
            <Button variant={activeAccordion === "overview" ? "secondary" : "ghost"} onClick={() => handleNavClick("overview")}>Overview</Button>
            {itinerary.map(day => (
                <Button key={day.id} variant={activeAccordion === day.id ? "secondary" : "ghost"} onClick={() => handleNavClick(day.id)}>DAY {day.day}</Button>
            ))}
            <Button variant={activeAccordion === "tobeplanned" ? "secondary" : "ghost"} onClick={() => handleNavClick("tobeplanned")}>代规划</Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full ml-2" onClick={handleAddDay}>
              <Plus className="h-4 w-4" />
            </Button>
        </div>
        
        <Accordion type="single" collapsible value={activeAccordion} onValueChange={setActiveAccordion} className="w-full">
          <AccordionItem value="overview" ref={el => sectionRefs.current['overview'] = el}>
            <AccordionTrigger>Overview</AccordionTrigger>
            <AccordionContent>
              <div className="p-4 bg-card rounded-lg">
                <h3 className="text-lg font-semibold">Overview</h3>
                <p className="text-muted-foreground mt-2">{trip.description || "No description available."}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {itinerary.map((day) => (
            <AccordionItem key={day.id} value={day.id} ref={el => sectionRefs.current[day.id] = el}>
              <AccordionTrigger>DAY {day.day}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-2 border-l-2 border-primary/50 ml-2">
                  {day.items.length > 0 ? day.items.map((item) => (
                    <div key={item.id} className="p-3 bg-card rounded-md shadow-sm flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        {item.time && <div className="text-sm text-muted-foreground">{item.time}</div>}
                        {item.notes && <p className="text-sm mt-1">{item.notes}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditItem(day.id, item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(day.id, item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No items for this day yet.</p>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => handleAddItem(day.id)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

          <AccordionItem value="tobeplanned" ref={el => sectionRefs.current['tobeplanned'] = el}>
            <AccordionTrigger>代规划</AccordionTrigger>
            <AccordionContent>
              <div className="p-4 bg-card rounded-lg">
                <h3 className="text-lg font-semibold">To Be Planned</h3>
                <p className="text-muted-foreground mt-2">Items to be planned for this trip.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notes" ref={el => sectionRefs.current['notes'] = el}>
            <AccordionTrigger>Notes</AccordionTrigger>
            <AccordionContent>
              <div className="p-4 bg-card rounded-lg">
                <h3 className="text-lg font-semibold">Trip Notes</h3>
                <p className="text-muted-foreground mt-2">Notes content goes here.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="costs" ref={el => sectionRefs.current['costs'] = el}>
            <AccordionTrigger>Costs</AccordionTrigger>
            <AccordionContent>
              <div className="p-4 bg-card rounded-lg">
                <h3 className="text-lg font-semibold">Costs</h3>
                <p className="text-muted-foreground mt-2">Costs tracking content goes here.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <TripSettings 
        trip={trip}
        open={isSettingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={handleSaveSettings}
        onDelete={handleDeleteTrip}
      />

      <AddCollaboratorDialog 
        open={isAddCollaboratorOpen}
        onOpenChange={setAddCollaboratorOpen}
      />

      {/* Item Form Dialog */}
      <Dialog open={isItemFormOpen} onOpenChange={setItemFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Modify the details of your itinerary item." : "Add a new item to your plan."}
            </DialogDescription>
          </DialogHeader>
          <ItineraryItemForm 
            onSubmit={handleSaveItem}
            initialValues={editingItem?.item}
            onCancel={() => setItemFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item from your itinerary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingItem(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Itinerary;