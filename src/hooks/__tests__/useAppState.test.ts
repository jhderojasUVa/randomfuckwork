/**
 * Tests for useAppState hook
 * Validates combined app state management
 */

import { renderHook } from '@testing-library/react';
import { useAppState } from '../useAppState';
import { UI_TEXT } from '../../constants';
import { useTheme } from '../useTheme';
import { useData } from '../useData';

jest.mock('../useTheme');
jest.mock('../useData');

const mockedUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;
const mockedUseData = useData as jest.MockedFunction<typeof useData>;

describe('useAppState hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockedUseTheme.mockReturnValue([
      'dark',
      jest.fn(),
      true, // isDarkMode
    ]);

    mockedUseData.mockReturnValue({
      data: [{ string: 'TestWord', word: 'TestWord' }],
      isLoading: false,
      dataType: 'array',
      dataSourceLabel: 'Internal',
      toggleDataSource: jest.fn(),
      refetch: jest.fn(),
    });
  });

  describe('initial state', () => {
    it('should return state object with all required properties', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('isDarkMode');
      expect(result.current).toHaveProperty('toggleTheme');
      expect(result.current).toHaveProperty('themeLabel');
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('dataType');
      expect(result.current).toHaveProperty('dataSourceLabel');
      expect(result.current).toHaveProperty('toggleDataSource');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('randomText');
      expect(result.current).toHaveProperty('fontSize');
      expect(result.current).toHaveProperty('appClass');
    });

    it('should combine both hooks results', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.theme).toBeDefined();
      expect(result.current.data).toBeDefined();
    });
  });

  describe('theme state management', () => {
    it('should expose theme state from useTheme', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.theme).toBe('dark');
    });

    it('should expose toggleTheme function', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(typeof result.current.toggleTheme).toBe('function');
    });

    it('should expose isDarkMode boolean', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(typeof result.current.isDarkMode).toBe('boolean');
      expect(result.current.isDarkMode).toBe(true);
    });

    it('should generate themeLabel from theme', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.themeLabel).toContain('DARK');
      expect(result.current.themeLabel).toContain('mode');
    });

    it('should update themeLabel when theme changes', () => {
      // Arrange
      mockedUseTheme.mockReturnValue(['light', jest.fn(), false]);

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.themeLabel).toContain('LIGHT');
    });
  });

  describe('data state management', () => {
    it('should expose data from useData', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('should expose isLoading state', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should expose dataType', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.dataType).toBe('array');
    });

    it('should expose dataSourceLabel', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(typeof result.current.dataSourceLabel).toBe('string');
    });

    it('should expose toggleDataSource function', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(typeof result.current.toggleDataSource).toBe('function');
    });

    it('should expose refetch function', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('randomText computation', () => {
    it('should select random text from array data', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [
          { string: 'word1', word: 'word1' },
          { string: 'word2', word: 'word2' },
          { string: 'word3', word: 'word3' },
        ],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      const words = ['word1', 'word2', 'word3'];
      expect(words).toContain(result.current.randomText);
    });

    it('should use Wikipedia title for wikipedia data type', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [{ string: 'Wikipedia Title', excerpt: 'excerpt' }],
        isLoading: false,
        dataType: 'wikipedia',
        dataSourceLabel: 'Wikipedia',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.randomText).toBe('Wikipedia Title');
    });

    it('should return loading text when isLoading is true and no data', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [],
        isLoading: true,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.randomText).toBe(UI_TEXT.LOADING_TEXT);
    });

    it('should return empty string when no data and not loading', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.randomText).toBe('');
    });

    it('should use word field as fallback when string is empty', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [{ string: '', word: 'fallback' }],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.randomText).toBe('fallback');
    });
  });

  describe('fontSize computation', () => {
    it('should return CSS style object with fontSize', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.fontSize).toHaveProperty('fontSize');
      expect(typeof result.current.fontSize.fontSize).toBe('string');
    });

    it('should calculate font size based on text length', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [{ string: 'Test', word: 'Test' }],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.fontSize.fontSize).toContain('calc');
      expect(result.current.fontSize.fontSize).toContain('100px'); // Base size
      expect(result.current.fontSize.fontSize).toContain('4px'); // Text length
    });

    it('should include calc formula in fontSize', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [{ string: 'ABC', word: 'ABC' }],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.fontSize.fontSize).toMatch(/^calc\(\d+px - \d+px\)$/);
    });

    it('should update when randomText changes', () => {
      // Arrange
      const { result, rerender } = renderHook(() => useAppState());
      const initialFontSize = result.current.fontSize.fontSize;

      mockedUseData.mockReturnValue({
        data: [{ string: 'VeryLongTextString', word: 'VeryLongTextString' }],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      rerender();

      // Assert
      expect(result.current.fontSize.fontSize).not.toBe(initialFontSize);
    });
  });

  describe('appClass computation', () => {
    it('should combine theme with App-header class', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.appClass).toContain('App-header');
      expect(result.current.appClass).toContain('dark');
    });

    it('should update appClass when theme changes', () => {
      // Arrange
      const { result, rerender } = renderHook(() => useAppState());
      expect(result.current.appClass).toContain('dark');

      mockedUseTheme.mockReturnValue(['light', jest.fn(), false]);

      // Act
      rerender();

      // Assert
      expect(result.current.appClass).toContain('light');
      expect(result.current.appClass).toContain('App-header');
    });

    it('should format as "App-header {theme}"', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.appClass).toMatch(/^App-header (dark|light)$/);
    });
  });

  describe('handler functions', () => {
    it('should expose toggleTheme handler', () => {
      // Arrange
      const mockToggleTheme = jest.fn();
      mockedUseTheme.mockReturnValue(['dark', mockToggleTheme, true]);

      // Act
      const { result } = renderHook(() => useAppState());
      result.current.toggleTheme();

      // Assert
      expect(mockToggleTheme).toHaveBeenCalled();
    });

    it('should expose toggleDataSource handler', () => {
      // Arrange
      const mockToggleDataSource = jest.fn();
      mockedUseData.mockReturnValue({
        data: [],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: mockToggleDataSource,
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());
      result.current.toggleDataSource();

      // Assert
      expect(mockToggleDataSource).toHaveBeenCalled();
    });

    it('should expose refetch handler', () => {
      // Arrange
      const mockRefetch = jest.fn();
      mockedUseData.mockReturnValue({
        data: [],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: mockRefetch,
      });

      // Act
      const { result } = renderHook(() => useAppState());
      result.current.refetch();

      // Assert
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('integration: complete workflow', () => {
    it('should handle all state and computed values in workflow', () => {
      // Arrange
      mockedUseTheme.mockReturnValue(['dark', jest.fn(), true]);
      mockedUseData.mockReturnValue({
        data: [{ string: 'TestWord', word: 'TestWord' }],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert - all state is accessible and computed correctly
      expect(result.current.theme).toBe('dark');
      expect(result.current.isDarkMode).toBe(true);
      expect(result.current.randomText).toBe('TestWord');
      expect(result.current.appClass).toBe('App-header dark');
      expect(result.current.themeLabel).toContain('DARK');
      expect(result.current.fontSize).toHaveProperty('fontSize');
      expect(result.current.dataSourceLabel).toBe('Internal');
    });

    it('should handle state changes from sub-hooks', () => {
      // Arrange
      const mockToggleTheme = jest.fn();
      mockedUseTheme.mockReturnValue(['dark', mockToggleTheme, true]);

      const { result } = renderHook(() => useAppState());

      // Act
      result.current.toggleTheme();

      // Assert
      expect(mockToggleTheme).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty data gracefully', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act & Assert
      expect(() => {
        renderHook(() => useAppState());
      }).not.toThrow();
    });

    it('should handle missing string and word fields', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [{ definition: 'only definition' }],
        isLoading: false,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.randomText).toBe('');
    });

    it('should handle loading state correctly', () => {
      // Arrange
      mockedUseData.mockReturnValue({
        data: [],
        isLoading: true,
        dataType: 'array',
        dataSourceLabel: 'Internal',
        toggleDataSource: jest.fn(),
        refetch: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useAppState());

      // Assert
      expect(result.current.isLoading).toBe(true);
      expect(result.current.randomText).toBe(UI_TEXT.LOADING_TEXT);
    });
  });
});
