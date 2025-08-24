
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
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <TheHeader />
      <main className="flex-grow pt-header-height pb-bottom-navbar-height md:pb-0">
        <Outlet />
      </main>
      <TheFooter />
      <BottomNavbar isDrawerOpen={drawer.isOpen} />
    </div>
  );
};

export default MainLayout;
