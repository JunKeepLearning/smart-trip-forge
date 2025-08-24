
import React from 'react';
import { NavLink } from 'react-router-dom';
import { navLinks } from './index';
import { cn } from '@/lib/utils';

interface BottomNavbarProps {
  isDrawerOpen: boolean;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ isDrawerOpen }) => {
  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 transition-transform duration-300 ease-in-out h-bottom-navbar-height",
      isDrawerOpen ? "translate-y-full" : "translate-y-0"
    )}>
      <div className="flex justify-around">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors ${
                isActive
                  ? 'text-primary fill-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`
            }
          >
            <Icon className="h-5 w-5 mb-1" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;
