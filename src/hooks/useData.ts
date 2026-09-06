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
    const saved = storageService.getDataSource(initialDataType);
    return (saved as DataType) || initialDataType;
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
   */
  const toggleDataSource = useCallback((): void => {
    setDataType((prev) => {
      const newType =
        prev === DATA_TYPES.WIKIPEDIA ? DATA_TYPES.ARRAY : DATA_TYPES.WIKIPEDIA;
      storageService.saveDataSource(newType);
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
  }, [dataType, fetchData]);

  return {
    data,
    isLoading,
    dataType,
    dataSourceLabel,
    toggleDataSource,
    refetch: fetchData,
  };
};
