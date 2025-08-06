import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import TheHeader from '@/components/TheHeader';
import TheFooter from '@/components/TheFooter';
import { 
  Plus, 
  Bot, 
  Package, 
  Edit, 
  Trash2, 
  ChevronDown, 
  Shirt, 
  Heart, 
  Smartphone, 
  Download,
  Save
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
}

interface ChecklistCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  items: ChecklistItem[];
}

interface Checklist {
  id: string;
  name: string;
  tags: string[];
  categories: ChecklistCategory[];
}

const Checklist = () => {
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mock data
  const checklists: Checklist[] = [
    {
      id: '1',
      name: 'European Summer Trip',
      tags: ['Summer', 'Europe', '2 weeks'],
      categories: [
        {
          id: 'clothing',
          name: 'Clothing',
          icon: Shirt,
          items: [
            { id: '1', name: 'Underwear (7 pairs)', checked: true },
            { id: '2', name: 'T-shirts (5)', checked: true },
            { id: '3', name: 'Jeans (2)', checked: false },
            { id: '4', name: 'Summer jacket', checked: false },
            { id: '5', name: 'Swimwear', checked: true },
          ]
        },
        {
          id: 'toiletries',
          name: 'Toiletries & Health',
          icon: Heart,
          items: [
            { id: '6', name: 'Toothbrush', checked: true },
            { id: '7', name: 'Toothpaste', checked: true },
            { id: '8', name: 'Shampoo', checked: false },
            { id: '9', name: 'Sunscreen', checked: true },
            { id: '10', name: 'First aid kit', checked: false },
          ]
        },
        {
          id: 'electronics',
          name: 'Electronics',
          icon: Smartphone,
          items: [
            { id: '11', name: 'Phone charger', checked: true },
            { id: '12', name: 'Camera', checked: false },
            { id: '13', name: 'Power bank', checked: false },
            { id: '14', name: 'Universal adapter', checked: true },
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Business Trip NYC',
      tags: ['Business', 'Short', '3 days'],
      categories: [
        {
          id: 'clothing',
          name: 'Clothing',
          icon: Shirt,
          items: [
            { id: '15', name: 'Business suits (2)', checked: false },
            { id: '16', name: 'Dress shirts (3)', checked: true },
            { id: '17', name: 'Ties (2)', checked: false },
          ]
        }
      ]
    }
  ];

  const getChecklistProgress = (checklist: Checklist) => {
    const totalItems = checklist.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const checkedItems = checklist.categories.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.checked).length, 0
    );
    return { checked: checkedItems, total: totalItems };
  };

  const openChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TheHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Action Bar */}
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
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Checklist
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Bot className="w-4 h-4 mr-2" />
              AI Checklist
            </Button>
            <Button variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </div>
        </div>

        {/* Checklist Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklists.map((checklist) => {
            const progress = getChecklistProgress(checklist);
            return (
              <Card 
                key={checklist.id} 
                className="bg-card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openChecklist(checklist)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{checklist.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {progress.checked} of {progress.total} packed
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {checklist.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {checklists.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No checklists yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven't created any trips yet, click above to start!
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Checklist
            </Button>
          </div>
        )}
      </main>

      {/* Checklist Detail Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-w-md ml-auto h-full">
          {selectedChecklist && (
            <>
              <DrawerHeader>
                <DrawerTitle className="text-xl">{selectedChecklist.name}</DrawerTitle>
              </DrawerHeader>
              
              <div className="flex-1 overflow-y-auto px-6">
                <div className="space-y-4">
                  {selectedChecklist.categories.map((category) => (
                    <Collapsible key={category.id} defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <div className="flex items-center gap-2">
                          <category.icon className="w-5 h-5 text-primary" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-2 space-y-2">
                        {category.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-2">
                            <Checkbox 
                              id={item.id}
                              checked={item.checked}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label 
                              htmlFor={item.id}
                              className={`flex-1 text-sm cursor-pointer ${
                                item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {item.name}
                            </label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>

              <Separator />
              
              {/* Bottom Actions */}
              <div className="p-6 space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear Checked
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
      <TheFooter />
    </div>
  );
};

export default Checklist;