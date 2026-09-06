/**
 * useTheme Hook
 * Manages theme state with localStorage persistence
 */

import { useState, useCallback, useEffect } from 'react';
import { CONFIG_DEFAULTS } from '../constants';
import { themeService, storageService } from '../services';

/**
 * Hook for managing theme state and persistence
 * Automatically loads theme from localStorage on mount
 * Persists theme changes to localStorage
 *
 * @param initialTheme - Optional initial theme value (default: CONFIG_DEFAULTS.DEFAULT_THEME)
 * @returns Tuple of [theme, toggleTheme, isDarkMode]
 *
 * @example
 * const [theme, toggleTheme, isDarkMode] = useTheme();
 * return (
 *   <>
 *     <div className={isDarkMode ? 'dark' : 'light'}>Content</div>
 *     <button onClick={toggleTheme}>Toggle Theme</button>
 *   </>
 * );
 */
export const useTheme = (
  initialTheme: string = CONFIG_DEFAULTS.DEFAULT_THEME
): [string, () => void, boolean] => {
  // Initialize theme from localStorage or provided initial value
  const [theme, setTheme] = useState<string>(() => {
    try {
      return storageService.getTheme(initialTheme);
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      return initialTheme;
    }
  });

  /**
   * Toggles between dark and light themes
   * Persists the new theme to localStorage
   */
  const toggleTheme = useCallback((): void => {
    setTheme((currentTheme) => {
      const newTheme = themeService.toggleTheme(currentTheme);
      return newTheme;
    });
  }, []);

  /**
   * Checks if current theme is dark mode
   */
  const isDarkMode = useCallback((): boolean => {
    return themeService.isDarkMode(theme);
  }, [theme]);

  // Apply theme to document when it changes
  useEffect(() => {
    themeService.applyTheme(theme);
    storageService.saveTheme(theme);
  }, [theme]);

  return [theme, toggleTheme, isDarkMode()];
};
