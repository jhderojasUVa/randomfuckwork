/**
 * Theme Service
 * Handles theme management and persistence
 */

import { THEMES } from '../constants';
import { storageService } from './storageService';

/**
 * Theme service for managing application theme
 * Provides methods for toggling and persisting theme preferences
 */
export const themeService = {
  /**
   * Toggles between dark and light themes
   * @param currentTheme - The current theme value
   * @returns The new theme value
   */
  toggleTheme: (currentTheme: string): string => {
    const newTheme =
      currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    storageService.saveTheme(newTheme);
    return newTheme;
  },

  /**
   * Determines if the current theme is dark mode
   * @param theme - The theme value to check
   * @returns True if theme is dark, false if light
   */
  isDarkMode: (theme: string): boolean => theme === THEMES.DARK,

  /**
   * Gets the opposite of the current theme
   * @param currentTheme - The current theme value
   * @returns The opposite theme value
   */
  getOppositeTheme: (currentTheme: string): string =>
    currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK,

  /**
   * Applies theme to document element
   * Updates the data-theme attribute on the HTML element
   * @param theme - The theme to apply
   */
  applyTheme: (theme: string): void => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  },
};
