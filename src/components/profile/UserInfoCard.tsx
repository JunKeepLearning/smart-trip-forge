// src/components/profile/UserInfoCard.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { User, Loader2 } from 'lucide-react'; // Import Loader2 for loading spinner
import { toast } from "sonner"; // Import toast for notifications

export function UserInfoCard() {
  const { user, loading, updateUserDisplayName } = useAuth();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempNickname, setTempNickname] = useState("");

  const nickname = user?.user_metadata?.display_name || user?.email;

  // Sync tempNickname when user data is available
  useEffect(() => {
    if (nickname) {
      setTempNickname(nickname);
    }
  }, [nickname]);

  const handleSaveChanges = async () => {
    if (!tempNickname.trim()) {
      toast.error("Nickname cannot be empty.");
      return;
    }

    setIsSaving(true);
    const { error } = await updateUserDisplayName(tempNickname);
    setIsSaving(false);

    if (error) {
      toast.error(`Failed to update profile: ${error}`);
    } else {
      toast.success("Profile updated successfully!");
      setIsDialogOpen(false);
    }
  };

  if (loading) {
    return <SkeletonCard />;
  }

  if (!user) {
    return <LoggedOutCard />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>View and manage your personal profile.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center space-y-4 text-center sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4 sm:text-left">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={nickname || 'User avatar'} />
            <AvatarFallback>
              <User className="h-10 w-10 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-semibold">{nickname}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Edit Profile</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your display name here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nickname" className="text-right">
                  Nickname
                </Label>
                <Input
                  id="nickname"
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

// Helper components for different states
const SkeletonCard = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center space-y-4 text-center sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4 sm:text-left">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex flex-col justify-center space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-32" />
    </CardFooter>
  </Card>
);

const LoggedOutCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>User Profile</CardTitle>
      <CardDescription>Please log in to view your profile.</CardDescription>
    </CardHeader>
    <CardContent>
      <Link to="/login">
        <Button className="w-full">Go to Login</Button>
      </Link>
    </CardContent>
  </Card>
);