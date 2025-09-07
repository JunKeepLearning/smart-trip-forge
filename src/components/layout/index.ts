import { Compass, Map, CheckSquare, CircleDollarSign } from 'lucide-react';

export const navLinks = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/plan", label: "Plan", icon: Map },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/costs", label: "Costs", icon: CircleDollarSign },
];

export { default as MainLayout } from './MainLayout';
export { default as TheHeader } from './TheHeader';
export { default as TheFooter } from './TheFooter';
export { default as BottomNavbar } from './BottomNavbar';