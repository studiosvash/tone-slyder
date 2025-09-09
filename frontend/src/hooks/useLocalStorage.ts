import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage persistence with React state
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Function to clear the stored value
  const clearValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
}

/**
 * Hook for auto-saving data with debouncing
 */
export function useAutoSave<T>(
  key: string,
  value: T,
  delay: number = 1000
): void {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error auto-saving to localStorage key "${key}":`, error);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [key, value, delay]);
}

/**
 * Hook for managing recent items list
 */
export function useRecentItems<T>(
  key: string,
  maxItems: number = 10
): [T[], (item: T) => void, () => void] {
  const [recentItems, setRecentItems] = useLocalStorage<T[]>(key, []);

  const addRecentItem = useCallback((item: T) => {
    setRecentItems(prev => {
      const filtered = prev.filter(existing => 
        JSON.stringify(existing) !== JSON.stringify(item)
      );
      return [item, ...filtered].slice(0, maxItems);
    });
  }, [setRecentItems, maxItems]);

  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
  }, [setRecentItems]);

  return [recentItems, addRecentItem, clearRecentItems];
}

/**
 * Hook for user preferences with defaults
 */
export function useUserPreferences() {
  const defaultPreferences = {
    preferredModel: 'gpt-3.5-turbo',
    autoSaveEnabled: true,
    showTips: true,
    defaultSliderValues: {
      formality: 50,
      conversational: 50,
      informativeness: 50,
      authoritativeness: 50
    },
    favoritePresets: [] as string[],
    recentGuardrails: {
      required: [] as string[],
      banned: [] as string[]
    }
  };

  const [preferences, setPreferences] = useLocalStorage(
    'tone-slyder-preferences',
    defaultPreferences
  );

  const updatePreference = useCallback(<K extends keyof typeof defaultPreferences>(
    key: K,
    value: typeof defaultPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences: () => setPreferences(defaultPreferences)
  };
}
