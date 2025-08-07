import { useState } from "react";
import TheHeader from "@/components/TheHeader";
import TheFooter from "@/components/TheFooter";
import { useParams } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ItineraryItemForm, ItineraryItemFormValues } from "@/components/ItineraryItemForm";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

// Data structures for the itinerary
interface ItineraryItem {
  id: string;
  time?: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'custom';
  name: string;
  notes?: string;
}

interface DayPlan {
  id: string;
  day: number;
  date: string;
  title: string;
  items: ItineraryItem[];
}

// Mock data for a trip to Beijing
const mockItinerary: DayPlan[] = [
  {
    id: "day1",
    day: 1,
    date: "2024-08-08",
    title: "Arrival and Historic Heart",
    items: [
      { id: "item1", time: "14:00", type: "hotel", name: "Check into Park Hyatt Beijing" },
      { id: "item2", time: "16:00", type: "attraction", name: "Tiananmen Square" },
      { id: "item3", time: "19:00", type: "restaurant", name: "Dinner at Quanjude Roast Duck" },
    ],
  },
  {
    id: "day2",
    day: 2,
    date: "2024-08-09",
    title: "Imperial Grandeur",
    items: [
      { id: "item4", time: "09:00", type: "attraction", name: "Forbidden City" },
      { id: "item5", time: "13:00", type: "restaurant", name: "Lunch near Jingshan Park" },
      { id: "item6", time: "15:00", type: "attraction", name: "Jingshan Park for panoramic views" },
      { id: "item7", time: "18:00", type: "custom", name: "Free evening, explore Wangfujing" },
    ],
  },
  {
    id: "day3",
    day: 3,
    date: "2024-08-10",
    title: "The Great Wall",
    items: [
      { id: "item8", time: "08:00", type: "attraction", name: "Day trip to Mutianyu Great Wall" },
    ],
  },
];

const Itinerary = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [itinerary, setItinerary] = useState<DayPlan[]>(mockItinerary);
  const [isItemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ dayId: string; item: ItineraryItem } | null>(null);
  const [addingToDayId, setAddingToDayId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ dayId: string; itemId: string } | null>(null);

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
    setItinerary(itinerary.map(day => {
      if (day.id === deletingItem.dayId) {
        return { ...day, items: day.items.filter(item => item.id !== deletingItem.itemId) };
      }
      return day;
    }));
    setDeletingItem(null);
  };

  const handleSaveItem = (values: ItineraryItemFormValues) => {
    if (editingItem) {
      // Update existing item
      setItinerary(itinerary.map(day => {
        if (day.id === editingItem.dayId) {
          return { ...day, items: day.items.map(item => item.id === editingItem.item.id ? { ...item, ...values } : item) };
        }
        return day;
      }));
    } else if (addingToDayId) {
      // Add new item
      const newItem: ItineraryItem = { id: Date.now().toString(), ...values };
      setItinerary(itinerary.map(day => {
        if (day.id === addingToDayId) {
          return { ...day, items: [...day.items, newItem] };
        }
        return day;
      }));
    }
    setItemFormOpen(false);
    setEditingItem(null);
    setAddingToDayId(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TheHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Beijing Cultural Journey</h1>
          <p className="text-muted-foreground">Trip ID: {tripId}</p>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full lg:w-2/3">
            <Accordion type="single" collapsible defaultValue="day1" className="w-full">
              {itinerary.map((day) => (
                <AccordionItem value={day.id} key={day.id}>
                  <AccordionTrigger>
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-lg">Day {day.day}: {day.title}</span>
                      <span className="text-sm text-muted-foreground">{day.date}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-2 border-l-2 border-primary/50 ml-2">
                      {day.items.map((item) => (
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
                      ))}
                      <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => handleAddItem(day.id)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <TheFooter />

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
