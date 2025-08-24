import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link2, UserPlus, Copy } from 'lucide-react';

const AddCollaboratorDialog = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Collaborators</DialogTitle>
          <DialogDescription>Share your trip with others to plan together.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">

          {/* Share via Link */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                <h3 className="font-semibold">Share via Link</h3>
            </div>
            <p className="text-sm text-muted-foreground">Anyone with this link can view the trip. This can be changed in settings.</p>
            <div className="flex items-center space-x-2">
              <Input id="link" defaultValue="https://example.com/trip/a1b2c3d4" readOnly />
              <Button type="submit" size="sm" className="px-3">
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add from Contacts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                <h3 className="font-semibold">Add from Contacts</h3>
            </div>
            <div className="relative">
              <Input placeholder="Search by name or email..." />
            </div>
            <div className="text-center text-sm text-muted-foreground py-4">
              <p>Contact search coming soon!</p>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCollaboratorDialog;
