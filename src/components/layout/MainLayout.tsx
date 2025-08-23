
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useUI } from '@/contexts/UIContext';
import TheHeader from '@/components/TheHeader';
import TheFooter from '@/components/TheFooter';
import BottomNavbar from './BottomNavbar';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const { drawer } = useUI();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <TheHeader />
      <main className="pb-16 md:pb-0">
        <Outlet />
      </main>
      <TheFooter />
      <div className={cn(
        "md:hidden transition-transform duration-300 ease-in-out",
        drawer.isOpen ? "translate-y-full" : "translate-y-0"
      )}>
        <BottomNavbar />
      </div>
    </div>
  );
};

export default MainLayout;
