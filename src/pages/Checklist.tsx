import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { useChecklists } from '@/contexts/ChecklistsContext';
import type { Checklist } from '@/contexts/ChecklistsContext';
import { 
  Plus, 
  Bot, 
  Package, 
  Trash2 
} from 'lucide-react';

const Checklist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checklists, addChecklist, deleteChecklist } = useChecklists();

  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [newChecklistTags, setNewChecklistTags] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<string | null>(null);

  const getChecklistProgress = (checklist: Checklist) => {
    if (!checklist.categories) return { checked: 0, total: 0 };
    const totalItems = checklist.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const checkedItems = checklist.categories.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.checked).length, 0
    );
    return { checked: checkedItems, total: totalItems };
  };

  const handleNewChecklist = () => {
    setNewChecklistName("");
    setNewChecklistTags("");
    setIsChecklistDialogOpen(true);
  };

  const openDeleteDialog = (checklistId: string) => {
    setChecklistToDelete(checklistId);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!checklistToDelete) return;
    deleteChecklist(checklistToDelete);
    toast({
      title: "Checklist deleted",
      description: "The checklist has been successfully deleted.",
    });
    setIsAlertOpen(false);
    setChecklistToDelete(null);
  };

  const handleSaveChecklist = () => {
    addChecklist({
      name: newChecklistName || "Untitled Checklist",
      tags: newChecklistTags.split(',').map(t => t.trim()).filter(Boolean),
    });
    toast({ title: "Checklist created" });
    setIsChecklistDialogOpen(false);
  };

  return (
    <>
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklists.map((checklist) => {
            const progress = getChecklistProgress(checklist);
            return (
              <ContextMenu key={checklist.id}>
                <ContextMenuTrigger>
                  <Card 
                    className="bg-card hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                    onClick={() => navigate(`/checklist/${checklist.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{checklist.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {progress.total > 0 ? `${progress.checked} of ${progress.total} packed` : "No items yet"}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end">
                      <div className="flex flex-wrap gap-1">
                        {checklist.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem 
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onSelect={() => openDeleteDialog(checklist.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>

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
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Checklist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newChecklistName}
                onChange={(e) => setNewChecklistName(e.target.value)}
                className="col-span-3"
                placeholder='e.g. "European Summer Trip"'
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input
                id="tags"
                value={newChecklistTags}
                onChange={(e) => setNewChecklistTags(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Summer, Europe, 2 weeks"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
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