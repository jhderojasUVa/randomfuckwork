/**
 * useAppState Hook
 * Combined hook for managing all application state
 * Aggregates theme, data, and loading states
 */

import React, { useMemo } from 'react';
import { UI_TEXT } from '../constants';
import { textFormatService } from '../services';
import { useTheme } from './useTheme';
import { useData } from './useData';

/**
 * Combined state management hook
 * Provides all app state and control methods in one interface
 *
 * @returns Object with all app state and control methods
 *
 * @example
 * const {
 *   theme,
 *   isDarkMode,
 *   toggleTheme,
 *   data,
 *   isLoading,
 *   dataType,
 *   toggleDataSource,
 *   randomText,
 *   fontSize,
 *   appClass,
 *   themeLabel,
 *   dataSourceLabel,
 *   refetch
 * } = useAppState();
 */
export const useAppState = () => {
  const [theme, toggleTheme, isDarkMode] = useTheme();
  const {
    data,
    isLoading,
    dataType,
    dataSourceLabel,
    toggleDataSource,
    refetch,
  } = useData();

  /**
   * Selects a random item from data or returns Wikipedia title
   */
  const randomText = useMemo((): string => {
    if (data.length > 0 && dataType === 'array') {
      // Get random item from array
      const randomItem = data[Math.floor(Math.random() * data.length)];
      return randomItem.string || randomItem.word || '';
    }
    if (dataType === 'wikipedia' && data.length > 0) {
      // Use first item (Wikipedia title)
      return data[0].string || '';
    }
    if (isLoading) {
      return UI_TEXT.LOADING_TEXT;
    }
    return '';
  }, [data, dataType, isLoading]);

  /**
   * Calculates dynamic font size based on text length
   */
  const fontSize = useMemo(
    (): React.CSSProperties =>
      textFormatService.calculateFontSize(randomText),
    [randomText]
  );

  /**
   * Combines theme class with App-header base class
   */
  const appClass = useMemo((): string => `App-header ${theme}`, [theme]);

  /**
   * Gets the label for current theme
   */
  const themeLabel = useMemo(
    (): string => `${theme.toUpperCase()} ${UI_TEXT.MODE_SUFFIX}`,
    [theme]
  );

  return {
    // Theme state
    theme,
    isDarkMode,
    toggleTheme,
    themeLabel,
    // Data state
    data,
    isLoading,
    dataType,
    dataSourceLabel,
    toggleDataSource,
    refetch,
    // Computed values
    randomText,
    fontSize,
    appClass,
  };
};
