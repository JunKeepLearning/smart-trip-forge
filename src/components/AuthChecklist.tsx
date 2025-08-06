import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Save, Cloud, HardDrive, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the structure of a checklist item
interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  created_at?: string;
}

const AuthChecklist: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Component state
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Local storage key for checklist data
  const STORAGE_KEY = 'travel_checklist_items';

  // Load data from localStorage on component mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Show info about database setup when user is logged in
  useEffect(() => {
    if (user) {
      toast({
        title: "Database Setup Required",
        description: "To enable cloud sync, create a 'checklist_items' table in your Supabase database.",
        variant: "default",
      });
    }
  }, [user]);

  // Load checklist items from localStorage
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedItems = JSON.parse(stored);
        setItems(parsedItems);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  // Save checklist items to localStorage
  const saveToLocalStorage = (itemsToSave: ChecklistItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Add a new checklist item
  const addItem = async () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setNewItemText('');
    
    // Save to localStorage
    saveToLocalStorage(updatedItems);

    // Note: Supabase sync would be implemented here when database table is ready
    if (user) {
      toast({
        title: "Item Added",
        description: "Item saved locally. Cloud sync pending database setup.",
      });
    }
  };

  // Toggle item completion status
  const toggleItem = async (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    setItems(updatedItems);
    saveToLocalStorage(updatedItems);

    // Note: Supabase sync would be implemented here when database table is ready
  };

  // Delete a checklist item
  const deleteItem = async (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    saveToLocalStorage(updatedItems);

    // Note: Supabase sync would be implemented here when database table is ready
  };

  // Handle Enter key press in input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  // Calculate completion statistics
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Travel Checklist
              </CardTitle>
              <CardDescription>
                {user ? (
                  <span className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Synced to cloud • {user.email}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Saved locally • Sign in to sync across devices
                  </span>
                )}
              </CardDescription>
            </div>
            {user && (
              <Alert className="mt-4">
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Database setup required for cloud sync. Create a 'checklist_items' table in Supabase with columns: id (text), user_id (uuid), text (text), completed (boolean), created_at (timestamp).
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardHeader>

        {/* Progress and Stats */}
        {totalCount > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{completedCount} of {totalCount} completed</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Add Item Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new item to your checklist..."
              className="flex-1"
            />
            <Button onClick={addItem} disabled={!newItemText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card>
        <CardContent className="pt-6">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items in your checklist yet.</p>
              <p className="text-sm mt-1">Add your first item above to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="shrink-0"
                  />
                  <span
                    className={`flex-1 ${
                      item.completed
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {item.text}
                  </span>
                  <Button
                    onClick={() => deleteItem(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Setup Info for logged in users */}
      {user && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Next Step:</strong> To enable cloud sync, create a 'checklist_items' table in your Supabase database with the following schema:
            <br />
            <code className="text-xs">id (text, primary), user_id (uuid), text (text), completed (boolean), created_at (timestamp)</code>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AuthChecklist;