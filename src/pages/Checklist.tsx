import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Bot, 
  Package, 
  Edit, 
  Trash2, 
  ChevronDown, 
  Shirt, 
  Star, 
  Smartphone, 
  Download,
  Save
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
}

interface ChecklistCategory {
  id: string;
  name: string;
  icon: string; // Use string for icon name
  items: ChecklistItem[];
}

interface Checklist {
  id: string;
  name: string;
  tags: string[];
  categories: ChecklistCategory[];
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  Shirt,
  Star,
  Smartphone,
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || Package;
};

const Checklist = () => {
  const { toast } = useToast();
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<string | null>(null);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Partial<Checklist> | null>(null);

  const [checklists, setChecklists] = useState<Checklist[]>([
    {
      id: '1',
      name: 'European Summer Trip',
      tags: ['Summer', 'Europe', '2 weeks'],
      categories: [
        {
          id: 'clothing',
          name: 'Clothing',
          icon: 'Shirt',
          items: [
            { id: '1', name: 'Underwear (7 pairs)', checked: true },
            { id: '2', name: 'T-shirts (5)', checked: true },
            { id: '3', name: 'Jeans (2)', checked: false },
            { id: '4', name: 'Summer jacket', checked: false },
            { id: '5', name: 'Swimwear', checked: true },
          ]
        },
        {
          id: 'toiletries',
          name: 'Toiletries & Health',
          icon: 'Star',
          items: [
            { id: '6', name: 'Toothbrush', checked: true },
            { id: '7', name: 'Toothpaste', checked: true },
            { id: '8', name: 'Shampoo', checked: false },
            { id: '9', name: 'Sunscreen', checked: true },
            { id: '10', name: 'First aid kit', checked: false },
          ]
        },
        {
          id: 'electronics',
          name: 'Electronics',
          icon: 'Smartphone',
          items: [
            { id: '11', name: 'Phone charger', checked: true },
            { id: '12', name: 'Camera', checked: false },
            { id: '13', name: 'Power bank', checked: false },
            { id: '14', name: 'Universal adapter', checked: true },
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Business Trip NYC',
      tags: ['Business', 'Short', '3 days'],
      categories: [
        {
          id: 'clothing',
          name: 'Clothing',
          icon: 'Shirt',
          items: [
            { id: '15', name: 'Business suits (2)', checked: false },
            { id: '16', name: 'Dress shirts (3)', checked: true },
            { id: '17', name: 'Ties (2)', checked: false },
          ]
        }
      ]
    }
  ]);

  const getChecklistProgress = (checklist: Checklist) => {
    const totalItems = checklist.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const checkedItems = checklist.categories.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.checked).length, 0
    );
    return { checked: checkedItems, total: totalItems };
  };

  const openChecklist = (checklist: Checklist) => {
    setSelectedChecklist(JSON.parse(JSON.stringify(checklist)));
    setIsDrawerOpen(true);
  };

  const handleCheckItem = (categoryId: string, itemId: string, checked: boolean) => {
    if (!selectedChecklist) return;

    const updatedChecklist = { ...selectedChecklist };
    const category = updatedChecklist.categories.find(c => c.id === categoryId);
    if (category) {
      const item = category.items.find(i => i.id === itemId);
      if (item) {
        item.checked = checked;
        setSelectedChecklist(updatedChecklist);
      }
    }
  };

  const handleSaveChanges = () => {
    if (!selectedChecklist) return;

    setChecklists(checklists.map(c => c.id === selectedChecklist.id ? selectedChecklist : c));
    setIsDrawerOpen(false);
    toast({
      title: "Changes saved",
      description: "Your checklist has been updated.",
    });
  };

  const openDeleteDialog = (e: React.MouseEvent, checklistId: string) => {
    e.stopPropagation();
    setChecklistToDelete(checklistId);
    setIsAlertOpen(true);
  };

  const handleDeleteChecklist = () => {
    if (!checklistToDelete) return;
    setChecklists(checklists.filter(c => c.id !== checklistToDelete));
    toast({
      title: "Checklist deleted",
      description: "The checklist has been successfully deleted.",
    });
    setIsAlertOpen(false);
    setChecklistToDelete(null);
  };

  const handleAddItem = () => {
    if (!selectedChecklist || !newItemName || !newItemCategory) return;

    const updatedChecklist = { ...selectedChecklist };
    const category = updatedChecklist.categories.find(c => c.id === newItemCategory);
    if (category) {
      category.items.push({
        id: crypto.randomUUID(),
        name: newItemName,
        checked: false,
      });
      setSelectedChecklist(updatedChecklist);
    }
    setNewItemName("");
    setNewItemCategory("");
    setIsAddItemDialogOpen(false);
    toast({
      title: "Item added",
      description: "The new item has been added to your checklist.",
    })
  };

  const handleClearChecked = () => {
    if (!selectedChecklist) return;

    const updatedChecklist = { ...selectedChecklist };
    updatedChecklist.categories.forEach(category => {
      category.items = category.items.filter(item => !item.checked);
    });
    setSelectedChecklist(updatedChecklist);
    toast({
      title: "Checked items cleared",
      description: "All packed items have been removed from the list.",
    })
  };

  const handleNewChecklist = () => {
    setEditingChecklist({});
    setIsChecklistDialogOpen(true);
  };

  const handleEditChecklist = (e: React.MouseEvent, checklist: Checklist) => {
    e.stopPropagation();
    setEditingChecklist(JSON.parse(JSON.stringify(checklist)));
    setIsChecklistDialogOpen(true);
  };

  const handleSaveChecklist = () => {
    if (!editingChecklist) return;

    if (editingChecklist.id) { // Existing checklist
      setChecklists(checklists.map(c => c.id === editingChecklist.id ? (editingChecklist as Checklist) : c));
      toast({ title: "Checklist updated" });
    } else { // New checklist
      const newChecklist: Checklist = {
        id: crypto.randomUUID(),
        name: editingChecklist.name || "Untitled Checklist",
        tags: editingChecklist.tags || [],
        categories: [
          { id: 'clothing', name: 'Clothing', icon: 'Shirt', items: [] },
          { id: 'toiletries', name: 'Toiletries & Health', icon: 'Star', items: [] },
          { id: 'electronics', name: 'Electronics', icon: 'Smartphone', items: [] },
        ],
      };
      setChecklists([...checklists, newChecklist]);
      toast({ title: "Checklist created" });
    }
    setIsChecklistDialogOpen(false);
    setEditingChecklist(null);
  };

  return (
    <>
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              My Packing Checklists
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize your trip items with smart checklists
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleNewChecklist}>
              <Plus className="w-4 h-4 mr-2" />
              New Checklist
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => toast({ title: "Coming Soon!", description: "AI Checklist feature is under development." })}>
              <Bot className="w-4 h-4 mr-2" />
              AI Checklist
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Coming Soon!", description: "Template feature is under development." })}>
              <Package className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </div>
        </div>

        {/* Checklist Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklists.map((checklist) => {
            const progress = getChecklistProgress(checklist);
            return (
              <Card 
                key={checklist.id} 
                className="bg-card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openChecklist(checklist)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{checklist.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {progress.checked} of {progress.total} packed
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {checklist.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={(e) => handleEditChecklist(e, checklist)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => openDeleteDialog(e, checklist.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {checklists.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No checklists yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven't created any trips yet, click above to start!
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleNewChecklist}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Checklist
            </Button>
          </div>
        )}
      </main>

      {/* Checklist Detail Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-w-md ml-auto h-full">
          {selectedChecklist && (
            <>
              <DrawerHeader>
                <DrawerTitle className="text-xl">{selectedChecklist.name}</DrawerTitle>
              </DrawerHeader>
              
              <div className="flex-1 overflow-y-auto px-6">
                <div className="space-y-4">
                  {selectedChecklist.categories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    return (
                    <Collapsible key={category.id} defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5 text-primary" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-2 space-y-2">
                        {category.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-2">
                            <Checkbox 
                              id={item.id}
                              checked={item.checked}
                              onCheckedChange={(checked) => handleCheckItem(category.id, item.id, !!checked)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label 
                              htmlFor={item.id}
                              className={`flex-1 text-sm cursor-pointer ${
                                item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {item.name}
                            </label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )})}
                </div>
              </div>

              <Separator />
              
              {/* Bottom Actions */}
              <div className="p-6 space-y-3">
                <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a new item</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                          Category
                        </Label>
                        <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedChecklist?.categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button onClick={handleAddItem}>Add Item</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={handleClearChecked}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear Checked
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Coming Soon!", description: "Export feature is under development." })}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSaveChanges}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              checklist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setChecklistToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChecklist}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChecklist?.id ? 'Edit Checklist' : 'New Checklist'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editingChecklist?.name || ''}
                onChange={(e) => setEditingChecklist({ ...editingChecklist, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input
                id="tags"
                value={editingChecklist?.tags?.join(', ') || ''}
                onChange={(e) => setEditingChecklist({ ...editingChecklist, tags: e.target.value.split(',').map(t => t.trim()) })}
                className="col-span-3"
                placeholder="e.g. Summer, Europe, 2 weeks"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={() => setEditingChecklist(null)}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSaveChecklist}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Checklist;
