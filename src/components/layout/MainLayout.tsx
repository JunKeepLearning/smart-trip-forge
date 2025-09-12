
import { Outlet } from 'react-router-dom';
import { useUIStore } from '@/stores/ui';
import {TheHeader, TheFooter} from '@/components/layout';
import BottomNavbar from './BottomNavbar';


const MainLayout = () => {
  const { drawer } = useUIStore();

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
