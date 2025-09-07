import React from 'react';
import { useUIStore } from '@/stores/ui';

const GlobalLoading = () => {
  const { loading } = useUIStore();

  if (!loading.isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        {loading.message && (
          <p className="text-lg text-foreground">{loading.message}</p>
        )}
      </div>
    </div>
  );
};

export default GlobalLoading;