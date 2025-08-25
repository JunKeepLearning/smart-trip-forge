import React, { createContext, useContext, useState, ReactNode } from 'react';

// Data structures for Checklists
export interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
}

export interface Collaborator {
  id: string;
  name: string;
  avatarUrl: string;
  permission: 'readonly' | 'write';
}

export interface Checklist {
  id: string;
  name: string;
  tags: string[];
  categories: ChecklistCategory[];
  permission: 'private' | 'link';
  collaborators: Collaborator[];
}

// Mock Data
const mockChecklists: Checklist[] = [
    {
      id: '1',
      name: 'European Summer Trip',
      tags: ['Summer', 'Europe', '2 weeks'],
      permission: 'link',
      collaborators: [
        { id: 'collab1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=alice', permission: 'write' },
        { id: 'collab2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=bob', permission: 'readonly' },
      ],
      categories: [
        {
          id: 'clothing',
          name: 'Clothing',
          icon: 'Shirt',
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
          icon: 'Star',
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
          icon: 'Smartphone',
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
      permission: 'private',
      collaborators: [],
      categories: [
        {
          id: 'clothing',
          name: 'Clothing',
          icon: 'Shirt',
          items: [
            { id: '15', name: 'Business suits (2)', checked: false },
            { id: '16', name: 'Dress shirts (3)', checked: true },
            { id: '17', name: 'Ties (2)', checked: false },
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
      permission: 'private',
      collaborators: [],
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

  const value = {
    checklists,
    getChecklistById,
    addChecklist,
    updateChecklist,
    deleteChecklist,
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
