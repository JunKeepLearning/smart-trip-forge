import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Image, User, Shield, CalendarIcon, ArrowRightLeft } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, parseISO, addDays, differenceInCalendarDays } from 'date-fns';
import { cn } from '@/lib/utils';
import AddCollaboratorDialog from '@/components/checklist/AddCollaboratorDialog';

const TripSettings = ({ trip, open, onOpenChange, onSave, onDelete }) => {
  if (!trip) return null;

  // States for controlled components
  const [name, setName] = useState(trip.name);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: parseISO(trip.startDate),
    to: parseISO(trip.endDate),
  });
  const [duration, setDuration] = useState(() => 
    differenceInCalendarDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1
  );
  const [permission, setPermission] = useState(trip.permission || 'private');
  const [dateInputMode, setDateInputMode] = useState<'duration' | 'dates'>('duration');
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [isPrivacyAlertOpen, setPrivacyAlertOpen] = useState(false);
  const [isAddCollaboratorOpen, setAddCollaboratorOpen] = useState(false);

  // Effect to sync dates when duration changes
  useEffect(() => {
    if (dateInputMode === 'duration') {
        const startDate = dateRange?.from || new Date();
        setDateRange({ from: startDate, to: addDays(startDate, duration - 1) });
    }
  }, [duration, dateInputMode]);

  // Effect to sync duration when dates change
  useEffect(() => {
    if (dateInputMode === 'dates' && dateRange?.from && dateRange?.to) {
        const newDuration = differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
        if (newDuration > 0) {
            setDuration(newDuration);
        }
    }
  }, [dateRange, dateInputMode]);

  const handleSaveChanges = () => {
    onSave({
      name,
      startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : trip.startDate,
      endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : trip.endDate,
      permission,
      collaborators: permission === 'private' ? [] : trip.collaborators,
    });
  };

  const handleDeleteConfirm = () => {
    setDeleteAlertOpen(false);
    onDelete();
  };

  const handlePermissionChange = (newPermission: string) => {
    if (newPermission === 'private' && permission === 'link') {
      setPrivacyAlertOpen(true);
    } else {
      setPermission(newPermission);
    }
  };

  const handlePrivacyConfirm = () => {
    setPermission('private');
    setPrivacyAlertOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Plan Settings</DialogTitle>
            <DialogDescription>Manage settings for your trip: {trip.name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-6">
            <div className="grid gap-8 py-4">

              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <Label htmlFor="trip-name">Trip Name</Label>
                  <Input id="trip-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <Label>Cover Image</Label>
                  <Button variant="outline"><Image className="w-4 h-4 mr-2" /> Change Cover</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Trip Dates</Label>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateInputMode(prev => prev === 'duration' ? 'dates' : 'duration')}
                    >
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      {dateInputMode === 'duration' ? 'Select by Date Range' : 'Select by Duration'}
                    </Button>
                  </div>
                  {dateInputMode === 'duration' ? (
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-center items-center">
                            <span className="text-2xl font-bold w-16 text-center">{duration}</span>
                            <span className="text-muted-foreground">Day{duration > 1 ? 's' : ''}</span>
                        </div>
                        <Slider
                            value={[duration]}
                            onValueChange={(value) => setDuration(value[0])}
                            max={30}
                            min={1}
                            step={1}
                        />
                    </div>
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>

              {/* Access Permissions */}
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

              {/* Collaborators */}
              {permission !== 'private' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Collaborators</h3>
                  <div className="space-y-2">
                    {(trip.collaborators || []).map(c => (
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

              {/* Delete Button */}
              <div className="space-y-4 border-t pt-4">
                <Button variant="destructive" className="w-full" onClick={() => setDeleteAlertOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete this Trip
                </Button>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your trip and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Privacy Confirmation */}
      <AlertDialog open={isPrivacyAlertOpen} onOpenChange={setPrivacyAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to Private?</AlertDialogTitle>
            <AlertDialogDescription>
              By making this trip private, all collaborators will be removed and sharing via link will be disabled. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePrivacyConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddCollaboratorDialog 
        open={isAddCollaboratorOpen}
        onOpenChange={setAddCollaboratorOpen}
      />
    </>
  );
};

export default TripSettings;