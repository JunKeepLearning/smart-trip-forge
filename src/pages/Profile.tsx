// src/pages/Profile.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import TheHeader from '@/components/TheHeader';
import TheFooter from '@/components/TheFooter';
import { useAuth } from '@/contexts/AuthContext';
import { UserInfoCard } from '@/components/profile/UserInfoCard';
import { SubscriptionCard } from '@/components/profile/SubscriptionCard';
import { HelpCenterCard } from '@/components/profile/HelpCenterCard';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Profile() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-background">
      <TheHeader />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">My Profile</h1>
        
        {/* Main content container with vertical stacking */}
        <div className="max-w-2xl mx-auto space-y-8">
          <UserInfoCard />
          <SubscriptionCard />
          <HelpCenterCard />
        </div>

        {/* Logout Button Section */}
        <div className="mt-12 flex justify-center">
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </main>

      <TheFooter />
    </div>
  );
}