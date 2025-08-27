import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChecklists, Checklist, ChecklistItem } from "@/contexts/ChecklistsContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Settings, Share2, Package, Shirt, Star, Smartphone, Plus, Car, Utensils, Gift, Camera, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ChecklistSettings from "@/components/ChecklistSettings";
import { Input } from "@/components/ui/input";
import AddCategoryDialog, { CategoryData } from "@/components/AddCategoryDialog";
import { Progress } from "@/components/ui/progress";
import { EditItemDialog } from "@/components/EditItemDialog";

const iconMap: { [key: string]: React.ComponentType<any> } = {
  Shirt, Star, Smartphone, Car, Utensils, Gift, Camera, Package,
};

const getIconComponent = (iconName: string) => iconMap[iconName] || Package;

const ChecklistDetail = () => {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getChecklistById, updateChecklist, deleteChecklist, updateItem, deleteItem } = useChecklists();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pristineChecklist, setPristineChecklist] = useState<Checklist | null>(null);
  const [localChecklist, setLocalChecklist] = useState<Checklist | null>(null);
  
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAddCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const newItemInputRef = useRef<HTMLInputElement>(null);

  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ item: ChecklistItem; categoryId: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!checklistId) {
        setIsLoading(false);
        return;
    }

    const fetchDetails = async () => {
        setIsLoading(true);
        const checklistData = await getChecklistById(checklistId);
        if (checklistData) {
            const deepCopy = JSON.parse(JSON.stringify(checklistData));
            setPristineChecklist(deepCopy);
            setLocalChecklist(deepCopy);
            setOpenCategories(deepCopy.categories.map(c => c.id));
        } else {
            // Handle case where checklist is not found
            setPristineChecklist(null);
            setLocalChecklist(null);
        }
        setIsLoading(false);
    };

    fetchDetails();
  }, [checklistId, getChecklistById]);

  const overallProgress = useMemo(() => {
    if (!localChecklist) return { checked: 0, total: 0 };
    let checked = 0;
    let total = 0;
    localChecklist.categories.forEach(cat => {
      total += cat.items.length;
      checked += cat.items.filter(item => item.checked).length;
    });
    return { checked, total };
  }, [localChecklist]);

  const isDirty = useMemo(() => {
    if (!pristineChecklist || !localChecklist) return false;
    return JSON.stringify(pristineChecklist) !== JSON.stringify(localChecklist);
  }, [pristineChecklist, localChecklist]);


  const handleCheckItem = (categoryId: string, itemId: string, checked: boolean) => {
    setLocalChecklist(prev => {
      if (!prev) return null;
      return { ...prev, categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, checked } : item) }
          : cat
      )};
    });
  };

  const handleAddItem = (categoryId: string) => {
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;
    setLocalChecklist(prev => {
      if (!prev) return null;
      const newItem = { id: crypto.randomUUID(), name: trimmedName, checked: false, quantity: 1 };
      return { ...prev, categories: prev.categories.map(cat => 
        cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat
      )};
    });
    setNewItemName('');
    newItemInputRef.current?.focus();
  };

  const handleAddCategory = (categoryData: CategoryData) => {
    if (!localChecklist) return;
    const newCategory = { id: `cat_${crypto.randomUUID()}`, ...categoryData, items: [] };
    setLocalChecklist(prev => prev ? { ...prev, categories: [...prev.categories, newCategory] } : null);
    setOpenCategories(prev => [...prev, newCategory.id]);
  };

  const handleOpenEditDialog = (item: ChecklistItem, categoryId: string) => {
    setSelectedItem({ item, categoryId });
    setEditDialogOpen(true);
  };

  const handleSaveItem = (itemData: Partial<Omit<ChecklistItem, 'id'>>) => {
    if (!localChecklist || !selectedItem) return;
    updateItem(localChecklist.id, selectedItem.categoryId, selectedItem.item.id, itemData);
    const newLocalChecklist = { ...localChecklist, categories: localChecklist.categories.map(cat => 
        cat.id === selectedItem.categoryId 
          ? { ...cat, items: cat.items.map(item => item.id === selectedItem.item.id ? { ...item, ...itemData } : item) }
          : cat
      )
    };
    setLocalChecklist(newLocalChecklist);
    setPristineChecklist(JSON.parse(JSON.stringify(newLocalChecklist)));
    toast({ title: "Item Updated", description: `"${itemData.name}" has been updated.` });
  };

  const handleDeleteItem = () => {
    if (!localChecklist || !selectedItem) return;
    const originalName = selectedItem.item.name;
    deleteItem(localChecklist.id, selectedItem.categoryId, selectedItem.item.id);
    const newLocalChecklist = { ...localChecklist, categories: localChecklist.categories.map(cat => 
        cat.id === selectedItem.categoryId 
          ? { ...cat, items: cat.items.filter(it => it.id !== selectedItem.item.id) }
          : cat
      )
    };
    setLocalChecklist(newLocalChecklist);
    setPristineChecklist(JSON.parse(JSON.stringify(newLocalChecklist)));
    toast({ title: "Item Deleted", description: `"${originalName}" has been deleted.`, variant: "destructive" });
  };

  const handleSave = async () => {
    if (!localChecklist) return;
    
    setIsSaving(true);
    const success = await updateChecklist(localChecklist);
    setIsSaving(false);

    if (success) {
      const deepCopy = JSON.parse(JSON.stringify(localChecklist));
      setPristineChecklist(deepCopy);
      toast({ title: "Checklist Saved", description: "Your changes have been saved successfully." });
    }
  };

  const handleSaveSettings = async (updatedData: Partial<Checklist>) => {
    if (!localChecklist) return;
    const updatedChecklist = { ...localChecklist, ...updatedData };
    
    setIsSaving(true);
    const success = await updateChecklist(updatedChecklist);
    setIsSaving(false);

    if (success) {
      const deepCopy = JSON.parse(JSON.stringify(updatedChecklist));
      setLocalChecklist(deepCopy);
      setPristineChecklist(deepCopy);
      toast({ title: "Settings Saved" });
    }
  };

  const handleDeleteChecklist = async () => {
    if (!localChecklist) return;
    const success = await deleteChecklist(localChecklist.id);
    if (success) {
      toast({ title: "Checklist Deleted" });
      navigate('/checklist');
    }
    // If it fails, the context will show a toast
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!localChecklist) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Checklist not found</h2>
        <Button onClick={() => navigate('/checklist')} className="mt-4">Back to Checklists</Button>
      </div>
    );
  }

  return (
    <>
      {localChecklist && (
        <div className="flex flex-col min-h-screen bg-background">
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/checklist')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <h1 className="text-3xl font-bold text-foreground">{localChecklist.name}</h1>
                <div className="flex items-center gap-2 mt-2">{localChecklist.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={() => {}}><Share2 className="h-4 w-4"/></Button>
                <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}><Settings className="h-4 w-4"/></Button>
                <Button onClick={handleSave} disabled={!isDirty || isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>

            <div className="my-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-semibold text-muted-foreground">{overallProgress.checked}/{overallProgress.total}</span>
              </div>
              <Progress value={overallProgress.total > 0 ? (overallProgress.checked / overallProgress.total) * 100 : 0} className="h-2" />
            </div>

            <div className="flex items-center justify-end gap-2 my-4">
                <Button variant="outline" size="sm" onClick={() => {}}>Expand All</Button>
                <Button variant="outline" size="sm" onClick={() => {}}>Collapse All</Button>
            </div>
            <Separator className="mb-4"/>

            <Accordion type="multiple" className="w-full" value={openCategories} onValueChange={setOpenCategories}>
              {localChecklist.categories.map(category => {
                const IconComponent = getIconComponent(category.icon);
                const categoryChecked = category.items.filter(i => i.checked).length;
                const categoryTotal = category.items.length;
                return (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                              <IconComponent className="w-5 h-5"/>
                              <span className="text-lg font-semibold">{category.name}</span>
                          </div>
                          <Badge variant="secondary" className="mr-4">{categoryChecked} / {categoryTotal}</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-8 space-y-3">
                        {category.items.map(item => (
                           <div key={item.id} className="flex items-center space-x-3">
                            <Checkbox 
                              id={`${category.id}-${item.id}`}
                              checked={item.checked}
                              onCheckedChange={(checked) => handleCheckItem(category.id, item.id, !!checked)}
                              className="w-5 h-5"
                            />
                            <div 
                                className="flex-1"
                                onDoubleClick={() => handleOpenEditDialog(item, category.id)}
                            >
                                <label 
                                    htmlFor={`${category.id}-${item.id}`}
                                    className={`font-medium cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                                >
                                    {item.name}
                                </label>
                                {item.notes && (
                                    <p className={`text-sm text-muted-foreground ${item.checked ? 'line-through' : ''}`}>
                                        {item.notes}
                                    </p>
                                )}
                            </div>
                          </div>
                        ))}
                        {category.items.length === 0 && <p className="text-muted-foreground text-sm">No items in this category.</p>}
                        <form
                          className="flex items-center space-x-2 pt-4"
                          onSubmit={(e) => { e.preventDefault(); handleAddItem(category.id); }}
                        >
                          <Input
                            ref={newItemInputRef}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Add a new item..."
                            className="flex-grow"
                          />
                          <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
                        </form>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>

            <Button variant="outline" className="w-full border-dashed mt-4 py-6" onClick={() => setAddCategoryOpen(true)}>
              <Plus className="h-5 w-5 mr-2" /> Add New Category
            </Button>
          </main>
        </div>
      )}

      <ChecklistSettings checklist={localChecklist} open={isSettingsOpen} onOpenChange={setSettingsOpen} onSave={handleSaveSettings} onDelete={handleDeleteChecklist} />
      {localChecklist && <AddCategoryDialog open={isAddCategoryOpen} onOpenChange={setAddCategoryOpen} onAddCategory={handleAddCategory} existingCategories={localChecklist.categories.map(c => c.name)} />}
      <EditItemDialog isOpen={isEditDialogOpen} onOpenChange={setEditDialogOpen} item={selectedItem?.item || null} onSave={handleSaveItem} onDelete={handleDeleteItem} />
    </>
  );
};

export default ChecklistDetail;
