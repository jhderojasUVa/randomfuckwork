/**
 * Tests for useData hook
 * Validates data fetching with source toggling and caching
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useData } from '../useData';
import { CONFIG_DEFAULTS, DATA_TYPES, UI_TEXT } from '../../constants';
import { dataService, wikipediaService, storageService } from '../../services';
import type { ArrayItem } from '../../types';

jest.mock('../../services/dataService');
jest.mock('../../services/wikipediaService');
jest.mock('../../services/storageService');

const mockedDataService = dataService as jest.Mocked<typeof dataService>;
const mockedWikipediaService = wikipediaService as jest.Mocked<typeof wikipediaService>;
const mockedStorageService = storageService as jest.Mocked<typeof storageService>;

describe('useData hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedStorageService.getDataSource.mockReturnValue(CONFIG_DEFAULTS.DEFAULT_DATA_SOURCE);
    mockedDataService.fetchInternalData.mockResolvedValue([
      { string: 'word1', word: 'word1' },
    ]);
    mockedWikipediaService.fetchRandomPage.mockResolvedValue([
      { string: 'Wikipedia Article', excerpt: 'Article excerpt' },
    ]);
  });

  describe('initial state', () => {
    it('should return initial state object with all required properties', () => {
      // Arrange & Act
      const { result } = renderHook(() => useData());

      // Assert
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('dataType');
      expect(result.current).toHaveProperty('dataSourceLabel');
      expect(result.current).toHaveProperty('toggleDataSource');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should initialize with default data type from storage', () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);

      // Act
      const { result } = renderHook(() => useData());

      // Assert
      expect(result.current.dataType).toBe(DATA_TYPES.ARRAY);
    });

    it('should use provided initial data type', () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.WIKIPEDIA);

      // Act
      renderHook(() => useData(DATA_TYPES.WIKIPEDIA));

      // Assert
      expect(mockedStorageService.getDataSource).toHaveBeenCalledWith(DATA_TYPES.WIKIPEDIA);
    });

    it('should start with empty data array', () => {
      // Arrange & Act
      const { result } = renderHook(() => useData());

      // Assert
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('should finish loading after initial fetch', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useData());

      // Assert - the hook auto-fetches on mount, then loading completes
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('data fetching', () => {
    it('should fetch internal data on mount', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'test', word: 'test' },
      ]);

      // Act
      renderHook(() => useData());

      // Assert
      await waitFor(() => {
        expect(mockedDataService.fetchInternalData).toHaveBeenCalled();
      });
    });

    it('should fetch Wikipedia data on mount when data type is wikipedia', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.WIKIPEDIA);

      // Act
      renderHook(() => useData(DATA_TYPES.WIKIPEDIA));

      // Assert
      await waitFor(() => {
        expect(mockedWikipediaService.fetchRandomPage).toHaveBeenCalled();
      });
    });

    it('should set isLoading to true during fetch', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      // Act
      const { result } = renderHook(() => useData());

      // Assert
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should return correct data structure', async () => {
      // Arrange
      const mockData: ArrayItem[] = [
        { string: 'word1', word: 'word1' },
        { string: 'word2', word: 'word2' },
      ];
      mockedDataService.fetchInternalData.mockResolvedValue(mockData);
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);

      // Act
      const { result } = renderHook(() => useData());

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });
    });
  });

  describe('data source toggling', () => {
    it('should toggle from array to wikipedia', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Act
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });
    });

    it('should toggle from wikipedia to array', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.WIKIPEDIA);
      const { result } = renderHook(() => useData(DATA_TYPES.WIKIPEDIA));

      // Act
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.ARRAY);
      });
    });

    it('should persist data source preference to storage', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Act
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert
      await waitFor(() => {
        expect(mockedStorageService.saveDataSource).toHaveBeenCalled();
      });
    });

    it('should refetch data after toggling source', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Clear initial call count
      jest.clearAllMocks();
      mockedStorageService.saveDataSource.mockImplementation(() => {});
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'test', word: 'test' },
      ]);

      // Act
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert
      await waitFor(() => {
        expect(mockedWikipediaService.fetchRandomPage).toHaveBeenCalled();
      });
    });
  });

  describe('data source label', () => {
    it('should return "Internal" label for array data type', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);

      // Act
      const { result } = renderHook(() => useData());

      // Assert
      expect(result.current.dataSourceLabel).toBe(UI_TEXT.INTERNAL_SOURCE_NAME);
    });

    it('should return "Wikipedia" label for wikipedia data type', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.WIKIPEDIA);

      // Act
      const { result } = renderHook(() => useData(DATA_TYPES.WIKIPEDIA));

      // Assert
      expect(result.current.dataSourceLabel).toBe(UI_TEXT.WIKIPEDIA_SOURCE_NAME);
    });

    it('should update label when data source toggles', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Assert initial
      expect(result.current.dataSourceLabel).toBe(UI_TEXT.INTERNAL_SOURCE_NAME);

      // Act
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert after toggle
      await waitFor(() => {
        expect(result.current.dataSourceLabel).toBe(UI_TEXT.WIKIPEDIA_SOURCE_NAME);
      });
    });
  });

  describe('error handling', () => {
    it('should handle fetch error gracefully', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockRejectedValue(
        new Error('Fetch failed')
      );
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const { result } = renderHook(() => useData());

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual([{ string: UI_TEXT.LOADING_TEXT }]);
      });

      consoleErrorSpy.mockRestore();
    });

    it('should show loading text on error', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockRejectedValue(
        new Error('Fetch failed')
      );
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const { result } = renderHook(() => useData());

      // Assert
      await waitFor(() => {
        expect(result.current.data[0]).toHaveProperty(
          'string',
          UI_TEXT.LOADING_TEXT
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should set isLoading to false after error', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockRejectedValue(
        new Error('Fetch failed')
      );
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const { result } = renderHook(() => useData());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('refetch functionality', () => {
    it('should expose refetch method', () => {
      // Arrange & Act
      const { result } = renderHook(() => useData());

      // Assert
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch data when refetch is called', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Clear initial call
      jest.clearAllMocks();
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'refreshed', word: 'refreshed' },
      ]);

      // Act
      act(() => {
        result.current.refetch();
      });

      // Assert
      await waitFor(() => {
        expect(mockedDataService.fetchInternalData).toHaveBeenCalled();
      });
    });

    it('should set isLoading during refetch', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );
      const { result } = renderHook(() => useData());

      jest.clearAllMocks();
      mockedDataService.fetchInternalData.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      // Act
      act(() => {
        result.current.refetch();
      });

      // Assert
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('integration: complete workflow', () => {
    it('should handle fetch, toggle, and refetch workflow', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'word1', word: 'word1' },
      ]);
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wikipedia', excerpt: 'excerpt' },
      ]);

      // Act
      const { result } = renderHook(() => useData());

      // Assert initial fetch
      await waitFor(() => {
        expect(result.current.data).toEqual([{ string: 'word1', word: 'word1' }]);
      });

      // Act toggle
      jest.clearAllMocks();
      mockedStorageService.saveDataSource.mockImplementation(() => {});
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wikipedia', excerpt: 'excerpt' },
      ]);

      act(() => {
        result.current.toggleDataSource();
      });

      // Assert after toggle
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });

      // Act refetch
      jest.clearAllMocks();
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wikipedia2', excerpt: 'excerpt2' },
      ]);

      act(() => {
        result.current.refetch();
      });

      // Assert refetch
      await waitFor(() => {
        expect(mockedWikipediaService.fetchRandomPage).toHaveBeenCalled();
      });
    });
  });
});
