import React from 'react';
import { useUIStore } from '@/stores/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GlobalNotifications = () => {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm">
      {notifications.map((notification) => (
        <Alert 
          key={notification.id} 
          className={`
            relative transition-all duration-300 ease-in-out
            ${notification.type === 'success' ? 'bg-green-50 border-green-200' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-red-200' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : ''}
            ${notification.type === 'info' ? 'bg-blue-50 border-blue-200' : ''}
          `}
        >
          <div className="flex items-start">
            <div className="flex-1">
              <AlertTitle className={`
                ${notification.type === 'success' ? 'text-green-800' : ''}
                ${notification.type === 'error' ? 'text-red-800' : ''}
                ${notification.type === 'warning' ? 'text-yellow-800' : ''}
                ${notification.type === 'info' ? 'text-blue-800' : ''}
              `}>
                {notification.title}
              </AlertTitle>
              {notification.message && (
                <AlertDescription className={`
                  ${notification.type === 'success' ? 'text-green-700' : ''}
                  ${notification.type === 'error' ? 'text-red-700' : ''}
                  ${notification.type === 'warning' ? 'text-yellow-700' : ''}
                  ${notification.type === 'info' ? 'text-blue-700' : ''}
                `}>
                  {notification.message}
                </AlertDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-2"
              onClick={() => removeNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default GlobalNotifications;