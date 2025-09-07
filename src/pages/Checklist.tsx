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
import { useChecklists, useCreateChecklist, useDeleteChecklist } from '@/hooks/api/useChecklists';
import type { Checklist as ChecklistType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Bot, 
  Package, 
  Trash2, 
  User, 
  Copy,
  Loader2
} from 'lucide-react';

// Skeleton component for loading state
const ChecklistCardSkeleton = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

const ChecklistCard = ({ checklist, isTemplate }: { checklist: ChecklistType, isTemplate?: boolean }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const deleteMutation = useDeleteChecklist();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const total = checklist.counts?.total || 0;
  const checked = checklist.counts?.checked || 0;

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(checklist.id, {
      onSuccess: () => {
        toast({ title: "Checklist deleted" });
        setIsAlertOpen(false);
      },
    });
  };

  const handleCopyTemplate = () => {
    toast({ title: "Coming Soon!", description: "You'll soon be able to copy templates to your checklists." });
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card 
            className="bg-card hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
            onClick={() => navigate(`/checklist/${checklist.id}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">{checklist.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {total > 0 ? `${checked} of ${total} packed` : "No items yet"}
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
          {isTemplate ? (
            <ContextMenuItem onSelect={handleCopyTemplate}>
              <Copy className="w-4 h-4 mr-2" />
              Use Template
            </ContextMenuItem>
          ) : (
            <ContextMenuItem 
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              onSelect={() => setIsAlertOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your checklist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const Checklist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: checklists, isLoading, isError } = useChecklists();
  const createMutation = useCreateChecklist();

  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [newChecklistTags, setNewChecklistTags] = useState("");

  const userChecklists = checklists?.filter(c => !c.is_template) || [];
  const templateChecklists = checklists?.filter(c => c.is_template) || [];

  const handleNewChecklist = () => {
    setNewChecklistName("");
    setNewChecklistTags("");
    setIsChecklistDialogOpen(true);
  };

  const handleSaveChecklist = () => {
    createMutation.mutate({
      name: newChecklistName || "Untitled Checklist",
      tags: newChecklistTags.split(',').map(t => t.trim()).filter(Boolean),
    }, {
      onSuccess: (newChecklist) => {
        toast({ title: "Checklist created" });
        setIsChecklistDialogOpen(false);
        navigate(`/checklist/${newChecklist.id}`);
      }
    });
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <ChecklistCardSkeleton key={index} />
      ))}
    </div>
  );

  return (
    <>
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Packing Checklists
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize your trip items with smart checklists and templates.
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
          </div>
        </div>

        <Tabs defaultValue="my-checklists" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-checklists">My Checklists</TabsTrigger>
            <TabsTrigger value="templates">Template Center</TabsTrigger>
          </TabsList>
          <TabsContent value="my-checklists">
            {isLoading ? renderSkeletons() : isError ? <p>Error loading checklists.</p> : (
              userChecklists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {userChecklists.map((checklist) => (
                    <ChecklistCard key={checklist.id} checklist={checklist} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No checklists yet</h3>
                  <p className="text-muted-foreground mb-6">You haven't created any checklists yet. Get started now!</p>
                  <Button onClick={handleNewChecklist}>Create Your First Checklist</Button>
                </div>
              )
            )}
          </TabsContent>
          <TabsContent value="templates">
            {isLoading ? renderSkeletons() : isError ? <p>Error loading templates.</p> : (
              templateChecklists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {templateChecklists.map((checklist) => (
                    <ChecklistCard key={checklist.id} checklist={checklist} isTemplate />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No templates available</h3>
                  <p className="text-muted-foreground">Check back later for pre-made checklist templates.</p>
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Checklist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={newChecklistName} onChange={(e) => setNewChecklistName(e.target.value)} className="col-span-3" placeholder='e.g. "European Summer Trip"' />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">Tags</Label>
              <Input id="tags" value={newChecklistTags} onChange={(e) => setNewChecklistTags(e.target.value)} className="col-span-3" placeholder="e.g. Summer, Europe, 2 weeks" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary" disabled={createMutation.isPending}>Cancel</Button></DialogClose>
            <Button onClick={handleSaveChecklist} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Checklist;
