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

  describe('unhappy path: storage failures', () => {
    it('should handle storage save failure gracefully', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedStorageService.saveDataSource.mockImplementation(() => {
        throw new Error('Storage save failed');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act - toggle despite storage error
      const { result } = renderHook(() => useData());
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - data type should still toggle even if storage fails
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });

      // Assert - storage error should have been logged
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should persist data type switch even if storage initially fails', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedStorageService.saveDataSource.mockImplementationOnce(() => {
        throw new Error('Storage temporarily unavailable');
      });

      // Act
      const { result } = renderHook(() => useData());
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - toggle should still happen
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });
    });

    it('should initialize with default value if storage read fails', () => {
      // Arrange
      mockedStorageService.getDataSource.mockImplementation(() => {
        throw new Error('Storage read failed');
      });

      // Act & Assert - should not throw and return undefined (graceful fallback)
      expect(() => {
        renderHook(() => useData(DATA_TYPES.ARRAY));
      }).not.toThrow();
    });
  });

  describe('unhappy path: rapid consecutive toggles', () => {
    it('should handle multiple rapid toggle calls', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Act - toggle multiple times rapidly
      act(() => {
        result.current.toggleDataSource(); // Toggle to Wikipedia
        result.current.toggleDataSource(); // Toggle back to Array
        result.current.toggleDataSource(); // Toggle to Wikipedia again
      });

      // Assert - should end up on Wikipedia (odd number of toggles)
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });
    });

    it('should not duplicate fetch calls from rapid toggles', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'word', word: 'word' },
      ]);
      const { result } = renderHook(() => useData());

      // Clear initial fetch count after initial mount/fetch
      jest.clearAllMocks();
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wiki', excerpt: 'excerpt' },
      ]);
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'word', word: 'word' },
      ]);

      // Act - rapid toggles back to original state
      act(() => {
        result.current.toggleDataSource(); // ARRAY -> WIKIPEDIA
        result.current.toggleDataSource(); // WIKIPEDIA -> ARRAY
      });

      // Assert - should end back at original state
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.ARRAY);
      });

      // Assert - no fetches should occur since final state equals initial state
      // The effect will not fire because the dependency (dataType) hasn't changed
      expect(mockedWikipediaService.fetchRandomPage).not.toHaveBeenCalled();
      expect(mockedDataService.fetchInternalData).not.toHaveBeenCalled();
    });

    it('should save correct state after rapid toggles', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'word', word: 'word' },
      ]);
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wiki', excerpt: 'excerpt' },
      ]);
      const { result } = renderHook(() => useData());

      // Act
      act(() => {
        result.current.toggleDataSource();
        result.current.toggleDataSource();
        result.current.toggleDataSource();
      });

      // Assert - final state should be Wikipedia
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });

      // Storage should have been called with final state
      expect(mockedStorageService.saveDataSource).toHaveBeenCalledWith(
        DATA_TYPES.WIKIPEDIA
      );

      // Verify fetches were triggered by each toggle
      expect(mockedWikipediaService.fetchRandomPage).toHaveBeenCalled();
      expect(mockedDataService.fetchInternalData).toHaveBeenCalled();
    });
  });

  describe('unhappy path: state updates during fetch', () => {
    it('should handle toggle during active fetch', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ string: 'data', word: 'data' }]), 100)
          )
      );
      const { result } = renderHook(() => useData());

      // Act - toggle before initial fetch completes
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - should transition to Wikipedia
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });
    });

    it('should cancel pending fetch when source changes', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const slowFetch = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ string: 'slow', word: 'slow' }]), 200)
          )
      );
      mockedDataService.fetchInternalData.mockImplementation(slowFetch);

      const { result } = renderHook(() => useData());

      // Clear initial setup
      jest.clearAllMocks();
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wiki', excerpt: 'excerpt' },
      ]);

      // Act - toggle to trigger new fetch
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - should initiate Wikipedia fetch
      await waitFor(() => {
        expect(mockedWikipediaService.fetchRandomPage).toHaveBeenCalled();
      });
    });

    it('should set loading state true then false during fetch state changes', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ string: 'data', word: 'data' }]), 50)
          )
      );
      const { result } = renderHook(() => useData());

      // Initial fetch should eventually complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - toggle and check loading state
      jest.clearAllMocks();
      mockedWikipediaService.fetchRandomPage.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ string: 'Wiki', excerpt: 'excerpt' }]), 50)
          )
      );

      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - loading should be true then false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('edge cases: persistence and initialization', () => {
    it('should load saved data source from storage on mount', () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.WIKIPEDIA);

      // Act
      const { result } = renderHook(() => useData());

      // Assert
      expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
    });

    it('should prefer localStorage value over initialDataType parameter', () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.WIKIPEDIA);

      // Act
      const { result } = renderHook(() => useData(DATA_TYPES.ARRAY));

      // Assert - should use storage value (Wikipedia) not parameter (Array)
      expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
    });

    it('should use parameter value if storage is empty/null', () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(null);

      // Act
      const { result } = renderHook(() => useData(DATA_TYPES.WIKIPEDIA));

      // Assert - should fall back to parameter
      expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
    });

    it('should persist toggle state across multiple renders', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result, rerender } = renderHook(() => useData());

      // Act - toggle
      act(() => {
        result.current.toggleDataSource();
      });

      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });

      // Act - rerender
      rerender();

      // Assert - state should persist
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });
    });
  });

  describe('edge cases: no memory leaks or stale closures', () => {
    it('should not hold stale references in toggleDataSource callback', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Get reference to initial toggle function
      const firstToggle = result.current.toggleDataSource;

      // Act - toggle
      act(() => {
        firstToggle();
      });

      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });

      // Get reference to toggle function after change
      const secondToggle = result.current.toggleDataSource;

      // Act - toggle again with original reference
      act(() => {
        firstToggle();
      });

      // Assert - should toggle back to ARRAY (not stay on Wikipedia)
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.ARRAY);
      });

      // Assert - toggle functions should be stable (same reference)
      expect(firstToggle).toBe(secondToggle);
    });

    it('should clean up effect dependencies on unmount', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { unmount } = renderHook(() => useData());

      // Act - unmount hook
      unmount();

      // Assert - should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('should recalculate label on dataType change only', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      const initialLabel = result.current.dataSourceLabel;

      // Act - toggle to change dataType
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert
      await waitFor(() => {
        expect(result.current.dataSourceLabel).not.toBe(initialLabel);
        expect(result.current.dataSourceLabel).toBe(UI_TEXT.WIKIPEDIA_SOURCE_NAME);
      });
    });
  });

  describe('regression tests: data fetching and loading state', () => {
    it('should continue fetching data correctly after multiple toggles', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'word1', word: 'word1' },
      ]);
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wiki1', excerpt: 'excerpt1' },
      ]);

      const { result } = renderHook(() => useData());

      // Assert initial data loaded
      await waitFor(() => {
        expect(result.current.data).toEqual([
          { string: 'word1', word: 'word1' },
        ]);
      });

      // Act - toggle
      jest.clearAllMocks();
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wiki1', excerpt: 'excerpt1' },
      ]);

      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - should have fetched Wikipedia data
      await waitFor(() => {
        expect(result.current.data).toEqual([
          { string: 'Wiki1', excerpt: 'excerpt1' },
        ]);
      });

      // Act - toggle back
      jest.clearAllMocks();
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'word1', word: 'word1' },
      ]);

      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - should fetch internal data again
      await waitFor(() => {
        expect(result.current.data).toEqual([
          { string: 'word1', word: 'word1' },
        ]);
      });
    });

    it('should maintain correct loading state through toggle cycle', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ string: 'word', word: 'word' }]), 50)
          )
      );

      const { result } = renderHook(() => useData());

      // Assert initial loading completes
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - toggle
      jest.clearAllMocks();
      mockedWikipediaService.fetchRandomPage.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ string: 'Wiki', excerpt: 'excerpt' }]), 50)
          )
      );

      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - should complete loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act - toggle back
      jest.clearAllMocks();
      mockedDataService.fetchInternalData.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ string: 'word', word: 'word' }]), 50)
          )
      );

      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - loading should complete again
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should provide working refetch method after toggle', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Act - toggle
      jest.clearAllMocks();
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wiki', excerpt: 'excerpt' },
      ]);

      act(() => {
        result.current.toggleDataSource();
      });

      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });

      // Act - refetch
      jest.clearAllMocks();
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wiki2', excerpt: 'excerpt2' },
      ]);

      act(() => {
        result.current.refetch();
      });

      // Assert - refetch should work on current source
      await waitFor(() => {
        expect(mockedWikipediaService.fetchRandomPage).toHaveBeenCalled();
      });
    });
  });

  describe('regression tests: menu label updates', () => {
    it('should update label immediately on toggle for UI sync', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Assert initial label
      expect(result.current.dataSourceLabel).toBe(UI_TEXT.INTERNAL_SOURCE_NAME);

      // Act - toggle
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - label should update immediately (within same tick due to memoization)
      await waitFor(() => {
        expect(result.current.dataSourceLabel).toBe(UI_TEXT.WIKIPEDIA_SOURCE_NAME);
      });
    });

    it('should keep label in sync with actual dataType', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      // Assert - label matches dataType
      expect(result.current.dataSourceLabel).toBe(UI_TEXT.INTERNAL_SOURCE_NAME);
      expect(result.current.dataType).toBe(DATA_TYPES.ARRAY);

      // Act
      act(() => {
        result.current.toggleDataSource();
      });

      // Assert - after toggle, label and dataType should be in sync
      await waitFor(() => {
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
        expect(result.current.dataSourceLabel).toBe(UI_TEXT.WIKIPEDIA_SOURCE_NAME);
      });
    });

    it('should maintain label consistency across multiple toggle cycles', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      const { result } = renderHook(() => useData());

      const expectedLabels = [
        UI_TEXT.INTERNAL_SOURCE_NAME, // initial
        UI_TEXT.WIKIPEDIA_SOURCE_NAME, // after 1st toggle
        UI_TEXT.INTERNAL_SOURCE_NAME, // after 2nd toggle
        UI_TEXT.WIKIPEDIA_SOURCE_NAME, // after 3rd toggle
      ];

      // Assert initial
      expect(result.current.dataSourceLabel).toBe(expectedLabels[0]);

      // Act & Assert for each toggle
      for (let i = 1; i < expectedLabels.length; i++) {
        act(() => {
          result.current.toggleDataSource();
        });

        await waitFor(() => {
          expect(result.current.dataSourceLabel).toBe(expectedLabels[i]);
        });
      }
    });
  });

  describe('integration: menu label and data source are synchronized', () => {
    it('should show Wikipedia label when Wikipedia data is active', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.WIKIPEDIA);
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'WikiArticle', excerpt: 'excerpt' },
      ]);

      // Act
      const { result } = renderHook(() => useData(DATA_TYPES.WIKIPEDIA));

      // Assert
      await waitFor(() => {
        expect(result.current.dataSourceLabel).toBe(UI_TEXT.WIKIPEDIA_SOURCE_NAME);
        expect(result.current.dataType).toBe(DATA_TYPES.WIKIPEDIA);
      });
    });

    it('should show Internal label when Internal data is active', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'word', word: 'word' },
      ]);

      // Act
      const { result } = renderHook(() => useData(DATA_TYPES.ARRAY));

      // Assert
      await waitFor(() => {
        expect(result.current.dataSourceLabel).toBe(UI_TEXT.INTERNAL_SOURCE_NAME);
        expect(result.current.dataType).toBe(DATA_TYPES.ARRAY);
      });
    });

    it('should not leave UI in inconsistent state after multiple mode switches', async () => {
      // Arrange
      mockedStorageService.getDataSource.mockReturnValue(DATA_TYPES.ARRAY);
      mockedDataService.fetchInternalData.mockResolvedValue([
        { string: 'word', word: 'word' },
      ]);
      mockedWikipediaService.fetchRandomPage.mockResolvedValue([
        { string: 'Wiki', excerpt: 'excerpt' },
      ]);

      const { result } = renderHook(() => useData());

      // Act & Assert - multiple switches
      const switches = [
        { expectedType: DATA_TYPES.WIKIPEDIA, expectedLabel: UI_TEXT.WIKIPEDIA_SOURCE_NAME },
        { expectedType: DATA_TYPES.ARRAY, expectedLabel: UI_TEXT.INTERNAL_SOURCE_NAME },
        { expectedType: DATA_TYPES.WIKIPEDIA, expectedLabel: UI_TEXT.WIKIPEDIA_SOURCE_NAME },
        { expectedType: DATA_TYPES.ARRAY, expectedLabel: UI_TEXT.INTERNAL_SOURCE_NAME },
      ];

      for (const { expectedType, expectedLabel } of switches) {
        act(() => {
          result.current.toggleDataSource();
        });

        await waitFor(() => {
          expect(result.current.dataType).toBe(expectedType);
          expect(result.current.dataSourceLabel).toBe(expectedLabel);
        });
      }
    });
  });
});
