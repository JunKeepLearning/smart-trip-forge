// localStorage.ts - Utility functions for localStorage operations
import type { User } from '@supabase/supabase-js';

const USER_DATA_KEY = 'user_data_cache';
const USER_DATA_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

interface CachedUserData {
  data: User;
  timestamp: number;
}

/**
 * Save user data to localStorage with timestamp
 * @param data User data to cache
 */
export const saveUserDataToCache = (data: User): void => {
  try {
    const cacheData: CachedUserData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save user data to cache:', error);
  }
};

/**
 * Load user data from localStorage if not expired
 * @returns Cached user data or null if expired/not found
 */
export const loadUserDataFromCache = (): User | null => {
  try {
    const cachedDataStr = localStorage.getItem(USER_DATA_KEY);
    if (!cachedDataStr) return null;

    const cachedData: CachedUserData = JSON.parse(cachedDataStr);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - cachedData.timestamp > USER_DATA_EXPIRY) {
      // Remove expired cache
      localStorage.removeItem(USER_DATA_KEY);
      return null;
    }
    
    return cachedData.data;
  } catch (error) {
    console.warn('Failed to load user data from cache:', error);
    return null;
  }
};

/**
 * Clear user data cache
 */
export const clearUserDataCache = (): void => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.warn('Failed to clear user data cache:', error);
  }
};