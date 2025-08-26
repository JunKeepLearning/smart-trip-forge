import React, { createContext, useContext, useState, ReactNode } from 'react';

// Data structures for Checklists
export interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  quantity: number;
  notes?: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
}

// export interface Collaborator {
//   id: string;
//   name: string;
//   avatarUrl: string;
//   permission: 'readonly' | 'write';
// }

export interface Checklist {
  id: string;
  name: string;
  tags: string[];
  categories: ChecklistCategory[];
  // permission: 'private' | 'link';
  // collaborators: Collaborator[];
}

// Mock Data
const mockChecklists: Checklist[] = [
    {
      id: '1',
      name: 'European Summer Trip',
      tags: ['Summer', 'Europe', '2 weeks'],
      // permission: 'link',
      // collaborators: [
      //   { id: 'collab1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=alice', permission: 'write' },
      //   { id: 'collab2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=bob', permission: 'readonly' },
      // ],
      categories: [
        {
          id: 'clothing',
          name: 'Clothing',
          icon: 'Shirt',
          items: [
            { id: '1', name: 'Underwear', checked: true, quantity: 7, notes: 'Lightweight material' },
            { id: '2', name: 'T-shirts', checked: true, quantity: 5 },
            { id: '3', name: 'Jeans', checked: false, quantity: 2, notes: 'One black, one blue' },
            { id: '4', name: 'Summer jacket', checked: false, quantity: 1 },
            { id: '5', name: 'Swimwear', checked: true, quantity: 2 },
          ]
        },
        {
          id: 'toiletries',
          name: 'Toiletries & Health',
          icon: 'Star',
          items: [
            { id: '6', name: 'Toothbrush', checked: true, quantity: 1 },
            { id: '7', name: 'Toothpaste', checked: true, quantity: 1 },
            { id: '8', name: 'Shampoo', checked: false, quantity: 1, notes: 'Travel size' },
            { id: '9', name: 'Sunscreen', checked: true, quantity: 1 },
            { id: '10', name: 'First aid kit', checked: false, quantity: 1 },
          ]
        },
        {
          id: 'electronics',
          name: 'Electronics',
          icon: 'Smartphone',
          items: [
            { id: '11', name: 'Phone charger', checked: true, quantity: 1 },
            { id: '12', name: 'Camera', checked: false, quantity: 1, notes: 'Bring extra SD card' },
            { id: '13', name: 'Power bank', checked: false, quantity: 1 },
            { id: '14', name: 'Universal adapter', checked: true, quantity: 1 },
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Business Trip NYC',
      tags: ['Business', 'Short', '3 days'],
      // permission: 'private',
      // collaborators: [],
      categories: [
        {
          id: 'clothing',
          name: 'Clothing',
          icon: 'Shirt',
          items: [
            { id: '15', name: 'Business suits', checked: false, quantity: 2 },
            { id: '16', name: 'Dress shirts', checked: true, quantity: 3 },
            { id: '17', name: 'Ties', checked: false, quantity: 2 },
          ]
        }
      ]
    }
  ];

// Define the shape of the context
interface ChecklistsContextType {
  checklists: Checklist[];
  getChecklistById: (id: string) => Checklist | undefined;
  addChecklist: (checklistData: Pick<Checklist, 'name' | 'tags'>) => Checklist;
  updateChecklist: (id: string, checklistData: Partial<Omit<Checklist, 'id'>>) => void;
  deleteChecklist: (id: string) => void;
  updateItem: (listId: string, categoryId: string, itemId: string, itemData: Partial<Omit<ChecklistItem, 'id'>>) => void;
  deleteItem: (listId: string, categoryId: string, itemId: string) => void;
}

// Create the context
const ChecklistsContext = createContext<ChecklistsContextType | undefined>(undefined);

// Create the provider component
export const ChecklistsProvider = ({ children }: { children: ReactNode }) => {
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);

  const getChecklistById = (id: string) => {
    return checklists.find(checklist => checklist.id === id);
  };

  const addChecklist = (checklistData: Pick<Checklist, 'name' | 'tags'>) => {
    const newChecklist: Checklist = {
      ...checklistData,
      id: crypto.randomUUID(),
      // permission: 'private',
      // collaborators: [],
      categories: [
          { id: 'clothing', name: 'Clothing', icon: 'Shirt', items: [] },
          { id: 'toiletries', name: 'Toiletries & Health', icon: 'Star', items: [] },
          { id: 'electronics', name: 'Electronics', icon: 'Smartphone', items: [] },
      ],
    };
    setChecklists(prev => [newChecklist, ...prev]);
    return newChecklist;
  };

  const updateChecklist = (id: string, checklistData: Partial<Omit<Checklist, 'id'>>) => {
    setChecklists(prev => 
      prev.map(checklist => 
        checklist.id === id ? { ...checklist, ...checklistData } : checklist
      )
    );
  };

  const deleteChecklist = (id: string) => {
    setChecklists(prev => prev.filter(checklist => checklist.id !== id));
  };

  const updateItem = (listId: string, categoryId: string, itemId: string, itemData: Partial<Omit<ChecklistItem, 'id'>>) => {
    setChecklists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          categories: list.categories.map(cat => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                items: cat.items.map(item => item.id === itemId ? { ...item, ...itemData } : item)
              };
            }
            return cat;
          })
        };
      }
      return list;
    }));
  };

  const deleteItem = (listId: string, categoryId: string, itemId: string) => {
    setChecklists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          categories: list.categories.map(cat => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                items: cat.items.filter(item => item.id !== itemId)
              };
            }
            return cat;
          })
        };
      }
      return list;
    }));
  };

  const value = {
    checklists,
    getChecklistById,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    updateItem,
    deleteItem,
  };

  return (
    <ChecklistsContext.Provider value={value}>
      {children}
    </ChecklistsContext.Provider>
  );
};

// Create a custom hook for easy consumption
export const useChecklists = () => {
  const context = useContext(ChecklistsContext);
  if (context === undefined) {
    throw new Error('useChecklists must be used within a ChecklistsProvider');
  }
  return context;
};
