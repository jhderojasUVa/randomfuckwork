/**
 * Wikipedia Service
 * Handles fetching data from Wikipedia API
 */

import axios, { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants';
import type { ArrayItem } from '../types';

/**
 * Response structure from Wikipedia API
 * @internal
 */
interface WikipediaResponse {
  /** Page title */
  title: string;
  /** Page extract/summary */
  extract?: string;
  /** Thumbnail image */
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

/**
 * Wikipedia service for fetching random Wikipedia page data
 * Provides methods for interacting with Wikipedia REST API
 */
export const wikipediaService = {
  /**
   * Fetches a random Wikipedia page
   * Returns the page title as the main data item
   *
   * @returns Promise that resolves with array containing the page title
   * @throws Error if fetch fails or data is invalid
   */
  fetchRandomPage: async (): Promise<ArrayItem[]> => {
    try {
      const response: AxiosResponse<WikipediaResponse> = await axios.get(
        API_ENDPOINTS.WIKIPEDIA_RANDOM
      );

      if (!response.data || !response.data.title) {
        throw new Error('Invalid response format from Wikipedia API');
      }

      // Return in same format as internal data for consistency
      const wikiItem: ArrayItem = {
        string: response.data.title,
        excerpt: response.data.extract,
      };

      return [wikiItem];
    } catch (error) {
      console.error('Failed to fetch Wikipedia data:', error);
      throw error;
    }
  },

  /**
   * Gets a random Wikipedia page title
   * Convenience method that returns just the title string
   *
   * @returns Promise that resolves with Wikipedia page title
   * @throws Error if fetch fails
   */
  getRandomPageTitle: async (): Promise<string> => {
    try {
      const result = await wikipediaService.fetchRandomPage();
      return result[0]?.string || '';
    } catch (error) {
      console.error('Failed to get Wikipedia page title:', error);
      throw error;
    }
  },
};
