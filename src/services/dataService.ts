/**
 * Data Service
 * Handles fetching and caching of internal data from JSON storage
 */

import axios, { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants';
import type { ArrayItem } from '../types';

/**
 * Data service for internal JSON data operations
 * Provides methods for fetching and managing internal data
 */
export const dataService = {
  /**
   * Cache for internal data to avoid repeated fetches
   * @internal
   */
  _cache: null as ArrayItem[] | null,

  /**
   * Indicates if data is currently being fetched
   * @internal
   */
  _isFetching: false,

  /**
   * Fetches data from internal JSON storage
   * Uses caching to avoid repeated fetches
   *
   * @returns Promise that resolves with array of data items
   * @throws Error if fetch fails or data is invalid
   */
  fetchInternalData: async (): Promise<ArrayItem[]> => {
    // Return cached data if available
    if (dataService._cache) {
      return dataService._cache;
    }

    // Prevent multiple concurrent fetches
    if (dataService._isFetching) {
      // Wait for current fetch to complete
      while (dataService._isFetching) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return dataService._cache || [];
    }

    try {
      dataService._isFetching = true;
      const response: AxiosResponse<ArrayItem[]> = await axios.get(
        API_ENDPOINTS.INTERNAL_DATA
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid data format: expected array');
      }

      dataService._cache = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch internal data:', error);
      throw error;
    } finally {
      dataService._isFetching = false;
    }
  },

  /**
   * Clears the internal data cache
   * Useful when data may have been updated
   */
  clearCache: (): void => {
    dataService._cache = null;
  },

  /**
   * Gets a random item from internal data
   * Fetches data if not already cached
   *
   * @returns Promise that resolves with a random data item
   * @throws Error if fetch fails or no data available
   */
  getRandomItem: async (): Promise<ArrayItem> => {
    const data = await dataService.fetchInternalData();

    if (data.length === 0) {
      throw new Error('No data available');
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  },

  /**
   * Gets random text from internal data
   * Extracts the string/word field from the random item
   *
   * @returns Promise that resolves with random text string
   * @throws Error if fetch fails or no data available
   */
  getRandomText: async (): Promise<string> => {
    const item = await dataService.getRandomItem();
    return item.string || item.word || '';
  },
};
