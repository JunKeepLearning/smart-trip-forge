import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthSubscriptionResult {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook to manage authentication state subscription
 * Properly handles subscription cleanup to prevent memory leaks
 */
export const useAuthSubscription = (): AuthSubscriptionResult => {
  const { user, session, loading, init } = useAuthStore();
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    try {
      // Initialize the auth subscription
      unsubscribe = init();
      setInitialized(true);
    } catch (err) {
      console.error('Failed to initialize auth subscription:', err);
      setError(err instanceof Error ? err : new Error('Unknown error initializing auth subscription'));
    }

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [init]);

  return {
    user,
    session,
    loading: !initialized || loading,
    error
  };
};