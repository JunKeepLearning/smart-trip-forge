import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChecklists, Checklist } from "@/contexts/ChecklistsContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Settings, Share2, Package, Shirt, Star, Smartphone, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ChecklistSettings from "@/components/ChecklistSettings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AddCollaboratorDialog from "@/components/AddCollaboratorDialog";


// Icon mapping
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Shirt,
  Star,
  Smartphone,
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || Package;
};

const ChecklistDetail = () => {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getChecklistById, updateChecklist, deleteChecklist } = useChecklists();
  const saveDraftTimeout = useRef<number | null>(null);

  // State for the pristine version of the checklist (the "master copy" from cloud)
  const [pristineChecklist, setPristineChecklist] = useState<Checklist | null>(null);
  // State for the local, editable version of the checklist (the "working copy")
  const [localChecklist, setLocalChecklist] = useState<Checklist | null>(null);
  
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAddCollaboratorOpen, setAddCollaboratorOpen] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingPath, setPendingPath] = useState("");
  const [draftToRestore, setDraftToRestore] = useState<Checklist | null>(null);

  // Effect to load checklist and check for local drafts
  useEffect(() => {
    const checklistFromContext = getChecklistById(checklistId || '');
    if (checklistFromContext) {
      const draftKey = `unsaved_checklist_${checklistId}`;
      const savedDraft = localStorage.getItem(draftKey);

      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        // Set pristine to the original from context, so we can compare against it
        setPristineChecklist(JSON.parse(JSON.stringify(checklistFromContext)));
        setDraftToRestore(draft);
      } else {
        const deepCopy = JSON.parse(JSON.stringify(checklistFromContext));
        setPristineChecklist(deepCopy);
        setLocalChecklist(deepCopy);
        setOpenCategories(deepCopy.categories.map(c => c.id));
      }
    } else {
      setPristineChecklist(null);
      setLocalChecklist(null);
    }
  }, [checklistId, getChecklistById]);

  // Calculate if there are unsaved changes
  const isDirty = useMemo(() => {
    if (!pristineChecklist || !localChecklist) return false;
    return JSON.stringify(pristineChecklist) !== JSON.stringify(localChecklist);
  }, [pristineChecklist, localChecklist]);

  // Effect to auto-save a draft to local storage
  useEffect(() => {
    if (saveDraftTimeout.current) {
      clearTimeout(saveDraftTimeout.current);
    }

    if (isDirty && localChecklist) {
      saveDraftTimeout.current = window.setTimeout(() => {
        const draftKey = `unsaved_checklist_${localChecklist.id}`;
        localStorage.setItem(draftKey, JSON.stringify(localChecklist));
        console.log("Draft saved to local storage.");
      }, 1000);
    } else if (!isDirty && localChecklist) {
      // Clean up draft if state becomes clean (e.g. after saving)
      const draftKey = `unsaved_checklist_${localChecklist.id}`;
      localStorage.removeItem(draftKey);
    }

    return () => {
      if (saveDraftTimeout.current) {
        clearTimeout(saveDraftTimeout.current);
      }
    };
  }, [localChecklist, isDirty]);

  // Warn user before leaving if there are unsaved changes (for browser actions)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = ''; // Required for Chrome
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);


  if (!localChecklist && !draftToRestore) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Checklist not found</h2>
        <p className="text-muted-foreground mt-2">The checklist you are looking for does not exist.</p>
        <Button onClick={() => navigate('/checklist')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checklists
        </Button>
      </div>
    );
  }

  const handleNavigate = (path: string) => {
    if (isDirty) {
      setPendingPath(path);
      setShowLeaveConfirm(true);
    } else {
      navigate(path);
    }
  };

  const handleLeaveConfirm = () => {
    navigate(pendingPath);
  };

  const handleRestoreDraft = () => {
    if (draftToRestore) {
      setLocalChecklist(draftToRestore);
      setOpenCategories(draftToRestore.categories.map(c => c.id));
      setDraftToRestore(null);
      toast({ title: "Draft Restored", description: "Your unsaved changes have been restored." });
    }
  };

  const handleDiscardDraft = () => {
    if (pristineChecklist) {
      const draftKey = `unsaved_checklist_${pristineChecklist.id}`;
      localStorage.removeItem(draftKey);
      setLocalChecklist(JSON.parse(JSON.stringify(pristineChecklist)));
      setOpenCategories(pristineChecklist.categories.map(c => c.id));
      setDraftToRestore(null);
    }
  };

  const handleCheckItem = (categoryId: string, itemId: string, checked: boolean) => {
    setLocalChecklist(prev => {
      if (!prev) return null;
      const newCategories = prev.categories.map(cat => {
        if (cat.id === categoryId) {
          const newItems = cat.items.map(item => {
            if (item.id === itemId) {
              return { ...item, checked };
            }
            return item;
          });
          return { ...cat, items: newItems };
        }
        return cat;
      });
      return { ...prev, categories: newCategories };
    });
  };

  const handleSaveChanges = () => {
    if (!localChecklist) return;
    updateChecklist(localChecklist.id, localChecklist);
    setPristineChecklist(JSON.parse(JSON.stringify(localChecklist)));
    const draftKey = `unsaved_checklist_${localChecklist.id}`;
    localStorage.removeItem(draftKey);
    toast({ title: "Success", description: "Your checklist has been saved to the cloud." });
  };

  const handleSaveSettings = (updatedData) => {
    if (!localChecklist) return;
    const updatedChecklist = { ...localChecklist, ...updatedData };
    updateChecklist(localChecklist.id, updatedChecklist);
    setLocalChecklist(updatedChecklist);
    setPristineChecklist(JSON.parse(JSON.stringify(updatedChecklist)));
    toast({ title: "Settings Saved", description: "Checklist details have been updated." });
  };

  const handleDeleteChecklist = () => {
    if (!localChecklist) return;
    const draftKey = `unsaved_checklist_${localChecklist.id}`;
    localStorage.removeItem(draftKey);
    deleteChecklist(localChecklist.id);
    toast({ title: "Checklist Deleted", description: "The checklist has been permanently deleted." });
    navigate('/checklist');
  };

  const handleShare = () => {
    if (localChecklist?.permission === 'link') {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Sharing link has been copied to your clipboard." });
    } else {
      toast({ 
        title: "Checklist is Private", 
        description: "Change the permission in Settings to share this checklist.",
        variant: "destructive"
      });
    }
  };

  const expandAll = () => localChecklist && setOpenCategories(localChecklist.categories.map(c => c.id));
  const collapseAll = () => setOpenCategories([]);

  return (
    <>
      {/* Draft Restore Dialog */}
      <AlertDialog open={!!draftToRestore}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Draft Found</AlertDialogTitle>
            <AlertDialogDescription>
              We found a draft with unsaved changes from your last session. Would you like to restore it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardDraft}>Discard</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreDraft}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {localChecklist && (
        <div className="flex flex-col min-h-screen bg-background">
          <main className="flex-grow container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <Button variant="ghost" size="sm" className="mb-4" onClick={() => handleNavigate('/checklist')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold text-foreground">{localChecklist.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    {localChecklist.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                </div>
                <div className="flex items-center mt-4">
                  <div className="flex items-center -space-x-2">
                    <TooltipProvider>
                      {(localChecklist.collaborators || []).slice(0, 3).map(c => (
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
                    {(localChecklist.collaborators?.length || 0) > 3 && (
                      <Avatar className="h-8 w-8 border-2 border-card bg-muted">
                        <AvatarFallback>+{(localChecklist.collaborators?.length || 0) - 3}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  {localChecklist.permission === 'link' && (
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full ml-2" onClick={() => setAddCollaboratorOpen(true)}>
                        <UserPlus className="h-4 w-4" />
                      </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-4 w-4"/></Button>
                <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}><Settings className="h-4 w-4"/></Button>
                <Button onClick={handleSaveChanges} disabled={!isDirty}>Save</Button>
              </div>
            </div>

            {/* Accordion Controls */}
            <div className="flex items-center justify-end gap-2 my-4">
                <Button variant="outline" size="sm" onClick={expandAll}>
                    Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
                    Collapse All
                </Button>
            </div>
            <Separator className="mb-4"/>

            {/* Content Accordion */}
            <Accordion type="multiple" className="w-full" value={openCategories} onValueChange={setOpenCategories}>
              {localChecklist.categories.map(category => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-3">
                            <IconComponent className="w-5 h-5"/>
                            <span className="text-lg font-semibold">{category.name}</span>
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
                            <label 
                              htmlFor={`${category.id}-${item.id}`}
                              className={`flex-1 text-base cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.name}
                            </label>
                          </div>
                        ))}
                        {category.items.length === 0 && (
                            <p className="text-muted-foreground text-sm">No items in this category.</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>

          </main>
        </div>
      )}

      {/* In-App Navigation Blocker Dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveConfirm}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ChecklistSettings
        checklist={localChecklist}
        open={isSettingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={handleSaveSettings}
        onDelete={handleDeleteChecklist}
      />
      <AddCollaboratorDialog 
        open={isAddCollaboratorOpen}
        onOpenChange={setAddCollaboratorOpen}
      />
    </>
  );
};

export default ChecklistDetail;