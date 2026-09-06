/**
 * Tests for dataService
 * Validates internal data fetching and caching operations
 */

import axios, { AxiosResponse } from 'axios';
import { dataService } from '../dataService';
import { API_ENDPOINTS } from '../../constants';
import type { ArrayItem } from '../../types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('dataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataService.clearCache();
  });

  afterEach(() => {
    dataService.clearCache();
  });

  describe('fetchInternalData', () => {
    it('should fetch data from correct API endpoint', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
        { string: 'word2', word: 'word2' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      await dataService.fetchInternalData();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.INTERNAL_DATA);
    });

    it('should return array of data items on success', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
        { string: 'word2', word: 'word2' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const result = await dataService.fetchInternalData();

      // Assert
      expect(result).toEqual(mockData);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should cache data and return cached data on subsequent calls', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const result1 = await dataService.fetchInternalData();
      const result2 = await dataService.fetchInternalData();

      // Assert
      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Only called once due to caching
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const mockError = new Error('API Error');
      mockedAxios.get.mockRejectedValue(mockError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(dataService.fetchInternalData()).rejects.toThrow(
        'API Error'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch internal data:',
        mockError
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should throw error if data is not an array', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({
        data: { invalid: 'data' },
      } as AxiosResponse);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(dataService.fetchInternalData()).rejects.toThrow(
        'Invalid data format: expected array'
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should throw error if response data is null', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: null } as AxiosResponse);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(dataService.fetchInternalData()).rejects.toThrow(
        'Invalid data format: expected array'
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should handle empty array response', async () => {
      // Arrange
      const mockData: ArrayItem[] = [];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const result = await dataService.fetchInternalData();

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return cached data for multiple concurrent requests', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const [result1, result2, result3] = await Promise.all([
        dataService.fetchInternalData(),
        dataService.fetchInternalData(),
        dataService.fetchInternalData(),
      ]);

      // Assert
      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      expect(result3).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Cached after first call
    });
  });

  describe('clearCache', () => {
    it('should clear cached data', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      await dataService.fetchInternalData();
      dataService.clearCache();
      await dataService.fetchInternalData();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Called twice after cache clear
    });

    it('should not throw error when clearing empty cache', () => {
      // Act & Assert
      expect(() => dataService.clearCache()).not.toThrow();
    });
  });

  describe('getRandomItem', () => {
    it('should return a random item from fetched data', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
        { string: 'word2', word: 'word2' },
        { string: 'word3', word: 'word3' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const result = await dataService.getRandomItem();

      // Assert
      expect(mockData).toContainEqual(result);
    });

    it('should handle single item in data', async () => {
      // Arrange
      const mockData: ArrayItem[] = [{ string: 'onlyword', word: 'onlyword' }];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const result = await dataService.getRandomItem();

      // Assert
      expect(result).toEqual(mockData[0]);
    });

    it('should throw error if data is empty', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: [] } as AxiosResponse);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(dataService.getRandomItem()).rejects.toThrow(
        'No data available'
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should handle API errors', async () => {
      // Arrange
      const mockError = new Error('API Error');
      mockedAxios.get.mockRejectedValue(mockError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(dataService.getRandomItem()).rejects.toThrow('API Error');

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should fetch fresh data if cache cleared', async () => {
      // Arrange
      const mockData1: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
      ];
      const mockData2: ArrayItem[] = [
        { string: 'word2', word: 'word2' },
      ];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData1,
      } as AxiosResponse);
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData2,
      } as AxiosResponse);

      // Act
      const result1 = await dataService.getRandomItem();
      dataService.clearCache();
      const result2 = await dataService.getRandomItem();

      // Assert
      expect(result1).toEqual(mockData1[0]);
      expect(result2).toEqual(mockData2[0]);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRandomText', () => {
    it('should return string field from random item', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
        { string: 'word2', word: 'word2' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const result = await dataService.getRandomText();

      // Assert
      expect(mockData.map((item) => item.string)).toContain(result);
    });

    it('should return word field if string field is empty', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: '', word: 'fallback' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const result = await dataService.getRandomText();

      // Assert
      expect(result).toBe('fallback');
    });

    it('should return empty string if both string and word are missing', async () => {
      // Arrange
      const mockData: ArrayItem[] = [{ definition: 'definition only' }];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const result = await dataService.getRandomText();

      // Assert
      expect(result).toBe('');
    });

    it('should handle API errors', async () => {
      // Arrange
      const mockError = new Error('API Error');
      mockedAxios.get.mockRejectedValue(mockError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(dataService.getRandomText()).rejects.toThrow('API Error');

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should throw error if data is empty', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: [] } as AxiosResponse);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(dataService.getRandomText()).rejects.toThrow(
        'No data available'
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should return different values with multiple calls', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
        { string: 'word2', word: 'word2' },
        { string: 'word3', word: 'word3' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(await dataService.getRandomText());
      }

      // Assert - With 3 items, we should get more than 1 unique result in 10 tries
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('integration: full workflow', () => {
    it('should handle complete fetch and random selection workflow', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
        { string: 'word2', word: 'word2' },
        { string: 'word3', word: 'word3' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData } as AxiosResponse);

      // Act
      const text1 = await dataService.getRandomText();
      const text2 = await dataService.getRandomText();

      // Assert
      expect(text1).toBeDefined();
      expect(text2).toBeDefined();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Cached data used
    });

    it('should handle cache refresh workflow', async () => {
      // Arrange
      const mockData1: ArrayItem[] = [{ string: 'word1', word: 'word1' }];
      const mockData2: ArrayItem[] = [{ string: 'word2', word: 'word2' }];
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockData1 } as AxiosResponse)
        .mockResolvedValueOnce({ data: mockData2 } as AxiosResponse);

      // Act
      const text1 = await dataService.getRandomText();
      dataService.clearCache();
      const text2 = await dataService.getRandomText();

      // Assert
      expect(text1).toBe('word1');
      expect(text2).toBe('word2');
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});
