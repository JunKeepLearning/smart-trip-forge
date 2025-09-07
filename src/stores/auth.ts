import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { saveUserDataToCache, loadUserDataFromCache, clearUserDataCache } from "@/lib/localStorage";

interface AuthError {
  message: string;
  code?: string;
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  init: () => () => void; // 返回 unsubscribe 函数
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updateUserDisplayName: (
    displayName: string
  ) => Promise<{ error?: AuthError }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  init: () => {
    // onAuthStateChange is the single source of truth.
    // It fires once on subscription with the current state, and then on every auth change.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      set({ session, user, loading: false });

      if (user) {
        saveUserDataToCache(user);
      } else {
        clearUserDataCache();
      }
    });

    // Return the unsubscribe function.
    return () => {
      subscription.unsubscribe();
    };
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // 分类错误类型
        let errorType: AuthError['type'] = 'unknown';
        if (error.message.includes('network')) {
          errorType = 'network';
        } else if (error.message.includes('Invalid') || error.message.includes('invalid')) {
          errorType = 'validation';
        } else if (error.status === 401 || error.status === 403) {
          errorType = 'auth';
        } else if (error.status && error.status >= 500) {
          errorType = 'server';
        }
        
        return { 
          error: { 
            message: error.message, 
            code: error.status?.toString(),
            type: errorType
          } 
        };
      }
      
      return {};
    } catch (err) {
      return { 
        error: { 
          message: "An unexpected error occurred", 
          type: 'unknown' 
        } 
      };
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });

      if (error) {
        // 分类错误类型
        let errorType: AuthError['type'] = 'unknown';
        if (error.message.includes('network')) {
          errorType = 'network';
        } else if (error.message.includes('Invalid') || error.message.includes('invalid')) {
          errorType = 'validation';
        } else if (error.status === 401 || error.status === 403) {
          errorType = 'auth';
        } else if (error.status && error.status >= 500) {
          errorType = 'server';
        }
        
        return { 
          error: { 
            message: error.message, 
            code: error.status?.toString(),
            type: errorType
          } 
        };
      }
      
      return {};
    } catch (err) {
      return { 
        error: { 
          message: "An unexpected error occurred", 
          type: 'unknown' 
        } 
      };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // 分类错误类型
        let errorType: AuthError['type'] = 'unknown';
        if (error.message.includes('network')) {
          errorType = 'network';
        } else if (error.status === 401 || error.status === 403) {
          errorType = 'auth';
        } else if (error.status && error.status >= 500) {
          errorType = 'server';
        }
        
        return { 
          error: { 
            message: error.message, 
            code: error.status?.toString(),
            type: errorType
          } 
        };
      }
      return {};
    } catch (err) {
      return { 
        error: { 
          message: "An unexpected error occurred", 
          type: 'unknown' 
        } 
      };
    } finally {
      set({ loading: false, user: null, session: null });
      clearUserDataCache();
    }
  },

  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        // 分类错误类型
        let errorType: AuthError['type'] = 'unknown';
        if (error.message.includes('network')) {
          errorType = 'network';
        } else if (error.message.includes('Invalid') || error.message.includes('invalid')) {
          errorType = 'validation';
        } else if (error.status === 401 || error.status === 403) {
          errorType = 'auth';
        } else if (error.status && error.status >= 500) {
          errorType = 'server';
        }
        
        return { 
          error: { 
            message: error.message, 
            code: error.status?.toString(),
            type: errorType
          } 
        };
      }
      return {};
    } catch (err) {
      return { 
        error: { 
          message: "An unexpected error occurred", 
          type: 'unknown' 
        } 
      };
    }
  },

  updateUserDisplayName: async (displayName) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });

      if (error) {
        // 分类错误类型
        let errorType: AuthError['type'] = 'unknown';
        if (error.message.includes('network')) {
          errorType = 'network';
        } else if (error.message.includes('Invalid') || error.message.includes('invalid')) {
          errorType = 'validation';
        } else if (error.status === 401 || error.status === 403) {
          errorType = 'auth';
        } else if (error.status && error.status >= 500) {
          errorType = 'server';
        }
        
        return { 
          error: { 
            message: error.message, 
            code: error.status?.toString(),
            type: errorType
          } 
        };
      }

      // 获取最新用户数据，避免和 onAuthStateChange 状态不一致
      const { data: { user }, error: fetchError } =
        await supabase.auth.getUser();

      if (fetchError) {
        // 分类错误类型
        let errorType: AuthError['type'] = 'unknown';
        if (fetchError.message.includes('network')) {
          errorType = 'network';
        } else if (fetchError.status === 401 || fetchError.status === 403) {
          errorType = 'auth';
        } else if (fetchError.status && fetchError.status >= 500) {
          errorType = 'server';
        }
        
        return { 
          error: { 
            message: fetchError.message, 
            code: fetchError.status?.toString(),
            type: errorType
          } 
        };
      }

      set({ user });
      return {};
    } catch (err) {
      return { 
        error: { 
          message: "An unexpected error occurred", 
          type: 'unknown' 
        } 
      };
    }
  },
}));
