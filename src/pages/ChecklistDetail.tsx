import { useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  useChecklist, 
  useUpdateChecklist, 
  useDeleteChecklist, 
  useAddCategory, 
  useAddItem, 
  useUpdateItem, 
  useDeleteItem 
} from '@/hooks/api/useChecklists';
import type { ChecklistItem } from '@/types';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Settings, Share2, Package, Shirt, Star, Smartphone, Plus, Car, Utensils, Gift, Camera, Loader2 } from "lucide-react";
import { CategoryData } from "@/components/checklist/AddCategoryDialog";
import { EditItemDialog , ChecklistSettings , AddCategoryDialog } from "@/components/checklist";

const iconMap: { [key: string]: React.ComponentType<any> } = {
  Shirt, Star, Smartphone, Car, Utensils, Gift, Camera, Package,
};

const getIconComponent = (iconName: string) => iconMap[iconName] || Package;

const ChecklistDetail = () => {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Server State via React Query ---
  const { data: checklist, isLoading: isChecklistLoading, isError } = useChecklist(checklistId);
  const updateChecklistMutation = useUpdateChecklist();
  const deleteChecklistMutation = useDeleteChecklist();
  const addCategoryMutation = useAddCategory();
  const addItemMutation = useAddItem();
  const updateItemMutation = useUpdateItem();
  const deleteItemMutation = useDeleteItem();

  // --- Local UI State ---
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAddCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ item: ChecklistItem; categoryId: string } | null>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);

  // Effect to expand all categories when checklist data loads
  useEffect(() => {
    if (checklist?.categories) {
      setOpenCategories(checklist.categories.map(c => c.id));
    }
  }, [checklist]);

  // --- Memoized Calculations ---
  const overallProgress = useMemo(() => {
    if (!checklist || !checklist.categories) return { checked: 0, total: 0 };
    const items = checklist.categories.flatMap(cat => cat.items || []);
    const checked = items.filter(item => item.checked).length;
    return { checked, total: items.length };
  }, [checklist]);

  // --- Event Handlers (Mutations) ---
  const handleCheckItem = (itemId: string, checked: boolean) => {
    updateItemMutation.mutate({ itemId, checked });
  };

  const handleAddItem = (categoryId: string) => {
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;
    addItemMutation.mutate({ categoryId, name: trimmedName }, {
      onSuccess: () => {
        setNewItemName('');
        newItemInputRef.current?.focus();
      }
    });
  };

  const handleAddCategory = (categoryData: CategoryData) => {
    if (!checklistId) return;
    addCategoryMutation.mutate({ checklistId, ...categoryData });
  };

  const handleOpenEditDialog = (item: ChecklistItem, categoryId: string) => {
    setSelectedItem({ item, categoryId });
    setEditDialogOpen(true);
  };

  const handleSaveItem = (itemData: Partial<Omit<ChecklistItem, 'id'>>) => {
    if (!selectedItem) return;
    updateItemMutation.mutate({ itemId: selectedItem.item.id, ...itemData }, {
      onSuccess: () => toast({ title: "Item Updated" })
    });
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    deleteItemMutation.mutate(selectedItem.item.id, {
      onSuccess: () => toast({ title: "Item Deleted", variant: "destructive" })
    });
  };

  const handleSaveSettings = (settingsData: { name: string; tags: string[] }) => {
    if (!checklist) return;
    updateChecklistMutation.mutate({ id: checklist.id, ...settingsData });
  };

  const handleDeleteChecklist = () => {
    if (!checklist) return;
    deleteChecklistMutation.mutate(checklist.id, {
      onSuccess: () => {
        toast({ title: "Checklist Deleted" });
        navigate('/checklist');
      }
    });
  };

  // --- Render Logic ---
  if (isChecklistLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isError || !checklist) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Checklist not found</h2>
        <Button onClick={() => navigate('/checklist')} className="mt-4">Back to Checklists</Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/checklist')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              <h1 className="text-3xl font-bold text-foreground">{checklist.name}</h1>
              <div className="flex items-center gap-2 mt-2">{checklist.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button variant="outline" size="icon" onClick={() => {}}><Share2 className="h-4 w-4"/></Button>
              <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}><Settings className="h-4 w-4"/></Button>
            </div>
          </div>

          <div className="my-4">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-semibold text-muted-foreground">{overallProgress.checked}/{overallProgress.total}</span>
            </div>
            <Progress value={overallProgress.total > 0 ? (overallProgress.checked / overallProgress.total) * 100 : 0} className="h-2" />
          </div>

          <Separator className="my-4"/>

          <Accordion type="multiple" className="w-full" value={openCategories} onValueChange={setOpenCategories}>
            {checklist.categories?.map(category => {
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
                            onCheckedChange={(checked) => handleCheckItem(item.id, !!checked)}
                            className="w-5 h-5"
                            disabled={updateItemMutation.isPending && updateItemMutation.variables?.itemId === item.id}
                          />
                          <div className="flex-1 flex items-center gap-2" onDoubleClick={() => handleOpenEditDialog(item, category.id)}>
                            <label htmlFor={`${category.id}-${item.id}`} className={`font-medium cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.name}
                            </label>
                            {updateItemMutation.isPending && updateItemMutation.variables?.itemId === item.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          </div>
                        </div>
                      ))}
                      {category.items.length === 0 && <p className="text-muted-foreground text-sm">No items in this category.</p>}
                      
                      <form className="flex items-center space-x-2 pt-4" onSubmit={(e) => { e.preventDefault(); handleAddItem(category.id); }}>
                        <Input
                          ref={newItemInputRef}
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Add a new item..."
                          className="flex-grow"
                          disabled={addItemMutation.isPending}
                        />
                        <Button type="submit" size="icon" disabled={addItemMutation.isPending}>
                          {addItemMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </form>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <Button variant="outline" className="w-full border-dashed mt-4 py-6" onClick={() => setAddCategoryOpen(true)}>
            <Plus className="h-5 w-5 mr-2" /> Add New Category
          </Button>
        </main>
      </div>

      <ChecklistSettings checklist={checklist} open={isSettingsOpen} onOpenChange={setSettingsOpen} onSave={handleSaveSettings} onDelete={handleDeleteChecklist} />
      {checklist && <AddCategoryDialog open={isAddCategoryOpen} onOpenChange={setAddCategoryOpen} onAddCategory={handleAddCategory} existingCategories={checklist.categories?.map(c => c.name) || []} />}
      <EditItemDialog isOpen={isEditDialogOpen} onOpenChange={setEditDialogOpen} item={selectedItem?.item || null} onSave={handleSaveItem} onDelete={handleDeleteItem} />
    </>
  );
};

export default ChecklistDetail;
