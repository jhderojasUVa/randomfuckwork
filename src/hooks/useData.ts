/**
 * useData Hook
 * Manages data fetching with source toggling and caching
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { CONFIG_DEFAULTS, DATA_TYPES, UI_TEXT } from '../constants';
import { dataService, wikipediaService, storageService } from '../services';
import type { ArrayItem, DataType } from '../types';

/**
 * Hook for managing data fetching from different sources
 * Handles both internal data and Wikipedia data
 * Automatically loads data source preference from localStorage
 * Manages loading state during async operations
 *
 * @param initialDataType - Optional initial data source type (default: CONFIG_DEFAULTS.DEFAULT_DATA_SOURCE)
 * @returns Object with data, isLoading, dataType, toggleDataSource, and refetch
 *
 * @example
 * const { data, isLoading, dataType, toggleDataSource, refetch } = useData();
 * return (
 *   <>
 *     {isLoading ? <div>Loading...</div> : <div>{data[0]?.string}</div>}
 *     <button onClick={toggleDataSource}>Toggle Data Source</button>
 *   </>
 * );
 */
export const useData = (
  initialDataType: DataType = CONFIG_DEFAULTS.DEFAULT_DATA_SOURCE as DataType
) => {
  // Initialize data source from localStorage or provided initial value
  const [dataType, setDataType] = useState<DataType>(() => {
    try {
      const saved = storageService.getDataSource(initialDataType);
      return (saved as DataType) || initialDataType;
    } catch (error) {
      // Gracefully fall back to initial data type if storage read fails
      console.error('Failed to read data source from storage:', error);
      return initialDataType;
    }
  });

  const [data, setData] = useState<ArrayItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Fetches data from the appropriate source
   * Updates loading state during fetch
   */
  const fetchData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (dataType === DATA_TYPES.WIKIPEDIA) {
        const result = await wikipediaService.fetchRandomPage();
        setData(result);
      } else {
        // For array data source, we fetch all data but will select randomly in component
        const result = await dataService.fetchInternalData();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setData([{ string: UI_TEXT.LOADING_TEXT }]);
    } finally {
      setIsLoading(false);
    }
  }, [dataType]);

  /**
   * Toggles between Wikipedia and internal data sources
   * Automatically refetches data from new source
   * Persists preference to localStorage
   *
   * Uses functional state update form to avoid closure issues and ensure
   * the state setter always receives the current state value. The empty
   * dependency array is safe here because:
   * 1. setDataType is a stable reference from useState
   * 2. We use the functional form (prev) => newValue to access current state
   * 3. This triggers the useEffect that depends on dataType
   * 4. Component re-renders with updated dataSourceLabel
   */
  const toggleDataSource = useCallback((): void => {
    setDataType((currentDataType) => {
      const newType =
        currentDataType === DATA_TYPES.WIKIPEDIA
          ? DATA_TYPES.ARRAY
          : DATA_TYPES.WIKIPEDIA;
      // Persist the new data source preference, but don't let storage errors block state updates
      try {
        storageService.saveDataSource(newType);
      } catch (error) {
        console.error('Failed to save data source preference:', error);
      }
      return newType;
    });
  }, []);

  /**
   * Gets the display label for the current data source
   */
  const dataSourceLabel = useMemo((): string => {
    return dataType === DATA_TYPES.WIKIPEDIA
      ? UI_TEXT.WIKIPEDIA_SOURCE_NAME
      : UI_TEXT.INTERNAL_SOURCE_NAME;
  }, [dataType]);

  // Fetch data on mount and when dataType changes
  useEffect(() => {
    void fetchData();
  }, [dataType]);

  return {
    data,
    isLoading,
    dataType,
    dataSourceLabel,
    toggleDataSource,
    refetch: fetchData,
  };
};
