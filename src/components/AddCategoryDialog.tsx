import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Car, Utensils, Gift, Camera } from 'lucide-react';

export interface CategoryData {
  name: string;
  icon: string;
}

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: CategoryData) => void;
  existingCategories: string[];
}

const suggestedCategories: CategoryData[] = [
  { name: 'Transportation', icon: 'Car' },
  { name: 'Food & Drink', icon: 'Utensils' },
  { name: 'Gifts', icon: 'Gift' },
  { name: 'Photo Gear', icon: 'Camera' },
  { name: 'Souvenirs', icon: 'Package' },
];

const AddCategoryDialog = ({ open, onOpenChange, onAddCategory, existingCategories }: AddCategoryDialogProps) => {
  const [customCategory, setCustomCategory] = useState('');

  const handleAddSuggested = (category: CategoryData) => {
    onAddCategory(category);
    onOpenChange(false);
  };

  const handleAddCustom = () => {
    if (customCategory.trim()) {
      onAddCategory({ name: customCategory.trim(), icon: 'Package' }); // Default icon
      setCustomCategory('');
      onOpenChange(false);
    }
  };

  const availableSuggestions = suggestedCategories.filter(
    (cat) => !existingCategories.includes(cat.name)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Category</DialogTitle>
          <DialogDescription>Select a suggestion or create your own.</DialogDescription>
        </DialogHeader>
        
        {availableSuggestions.length > 0 && (
            <div className="py-4">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                {availableSuggestions.map((category) => (
                    <Button 
                        key={category.name} 
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handleAddSuggested(category)}
                    >
                        <span>{category.name}</span>
                    </Button>
                ))}
                </div>
            </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Create a custom category</h3>
          <div className="flex items-center space-x-2">
            <Input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g., 'Baby Supplies'"
            />
            <Button onClick={handleAddCustom}>Add</Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;