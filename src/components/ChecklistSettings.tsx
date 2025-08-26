import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, User, Shield } from 'lucide-react';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import AddCollaboratorDialog from '@/components/AddCollaboratorDialog';

const ChecklistSettings = ({ checklist, open, onOpenChange, onSave, onDelete }) => {
  if (!checklist) return null;

  const [name, setName] = useState(checklist.name);
  const [tags, setTags] = useState(checklist.tags.join(', '));
  // const [permission, setPermission] = useState(checklist.permission || 'private');
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  // const [isPrivacyAlertOpen, setPrivacyAlertOpen] = useState(false);
  // const [isAddCollaboratorOpen, setAddCollaboratorOpen] = useState(false);

  useEffect(() => {
    if (checklist) {
      setName(checklist.name);
      setTags(checklist.tags.join(', '));
      // setPermission(checklist.permission || 'private');
    }
  }, [checklist]);

  const handleSaveChanges = () => {
    onSave({
      name,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      // permission,
      // collaborators: permission === 'private' ? [] : checklist.collaborators,
    });
    onOpenChange(false);
  };

  const handleDeleteConfirm = () => {
    setDeleteAlertOpen(false);
    onDelete();
  };

  // const handlePermissionChange = (newPermission: string) => {
  //   if (newPermission === 'private' && permission === 'link') {
  //     setPrivacyAlertOpen(true);
  //   } else {
  //     setPermission(newPermission);
  //   }
  // };

  // const handlePrivacyConfirm = () => {
  //   setPermission('private');
  //   setPrivacyAlertOpen(false);
  // };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Checklist Settings</DialogTitle>
            <DialogDescription>Manage settings for your checklist: {checklist.name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-6">
            <div className="grid gap-8 py-4">

              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">General</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label htmlFor="checklist-name" className="md:text-right">Name</Label>
                  <Input id="checklist-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label htmlFor="checklist-tags" className="md:text-right">Tags</Label>
                  <Input id="checklist-tags" value={tags} onChange={(e) => setTags(e.target.value)} className="col-span-2" placeholder="e.g. Summer, Europe, 2 weeks" />
                </div>
              </div>

              {/* Access Permissions */}
              {/*
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Permissions</h3>
                <RadioGroup value={permission} onValueChange={handlePermissionChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">Private</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="link" id="link" />
                    <Label htmlFor="link">Visible to link holders</Label>
                  </div>
                </RadioGroup>
              </div>
              */}

              {/* Collaborators */}
              {/*
              {permission !== 'private' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Collaborators</h3>
                  <div className="space-y-2">
                    {(checklist.collaborators || []).map(c => (
                      <div key={c.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={c.avatarUrl} alt={c.name} />
                            <AvatarFallback>{c.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{c.name}</span>
                        </div>
                        <Select defaultValue={c.permission || 'readonly'}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="readonly">Read-only</SelectItem>
                            <SelectItem value="write">Can edit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setAddCollaboratorOpen(true)}><User className="w-4 h-4 mr-2" /> Invite Collaborator</Button>
                </div>
              )}
              */}

              {/* Delete Button */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Delete this checklist</p>
                        <p className="text-sm text-muted-foreground">Once deleted, it cannot be recovered.</p>
                    </div>
                    <Button variant="destructive" onClick={() => setDeleteAlertOpen(true)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                </div>
              </div>

            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this checklist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Privacy Confirmation */}
      {/*
      <AlertDialog open={isPrivacyAlertOpen} onOpenChange={setPrivacyAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to Private?</AlertDialogTitle>
            <AlertDialogDescription>
              By making this checklist private, all collaborators will be removed and sharing via link will be disabled. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePrivacyConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      */}

      {/*
      <AddCollaboratorDialog 
        open={isAddCollaboratorOpen}
        onOpenChange={setAddCollaboratorOpen}
      />
      */}
    </>
  );
};

export default ChecklistSettings;
