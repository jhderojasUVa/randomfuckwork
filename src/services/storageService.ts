/**
 * Storage Service
 * Handles localStorage operations for persisting user preferences
 */

import { STORAGE_KEYS } from '../constants';

/**
 * Storage service for managing application preferences
 * Provides methods for storing and retrieving theme and data source preferences
 */
export const storageService = {
  /**
   * Saves theme preference to localStorage
   * @param theme - The theme to save ('dark' or 'light')
   */
  saveTheme: (theme: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  },

  /**
   * Retrieves theme preference from localStorage
   * @param defaultTheme - Default theme if not found in storage
   * @returns The saved theme or default theme
   */
  getTheme: (defaultTheme: string): string => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || defaultTheme;
    } catch (error) {
      console.error('Failed to retrieve theme preference:', error);
      return defaultTheme;
    }
  },

  /**
   * Saves data source preference to localStorage
   * @param dataSource - The data source to save ('array' or 'wikipedia')
   */
  saveDataSource: (dataSource: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.DATA_TYPE, dataSource);
    } catch (error) {
      console.error('Failed to save data source preference:', error);
    }
  },

  /**
   * Retrieves data source preference from localStorage
   * @param defaultDataSource - Default data source if not found in storage
   * @returns The saved data source or default data source
   */
  getDataSource: (defaultDataSource: string): string => {
    try {
      return localStorage.getItem(STORAGE_KEYS.DATA_TYPE) || defaultDataSource;
    } catch (error) {
      console.error('Failed to retrieve data source preference:', error);
      return defaultDataSource;
    }
  },

  /**
   * Clears all application preferences from localStorage
   */
  clearPreferences: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.THEME);
      localStorage.removeItem(STORAGE_KEYS.DATA_TYPE);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  },
};
