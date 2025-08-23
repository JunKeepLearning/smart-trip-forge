
import React, { createContext, useContext, useState, ReactNode } from 'react';

type DrawerType = 'destination' | 'route' | 'spot';

interface DrawerState {
  isOpen: boolean;
  item: any;
  type: DrawerType | null;
}

interface UIContextType {
  drawer: DrawerState;
  openDrawer: (item: any, type: DrawerType) => void;
  closeDrawer: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [drawer, setDrawer] = useState<DrawerState>({
    isOpen: false,
    item: null,
    type: null,
  });

  const openDrawer = (item: any, type: DrawerType) => {
    setDrawer({ isOpen: true, item, type });
  };

  const closeDrawer = () => {
    setDrawer({ isOpen: false, item: null, type: null });
  };

  return (
    <UIContext.Provider value={{ drawer, openDrawer, closeDrawer }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
