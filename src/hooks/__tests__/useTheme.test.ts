/**
 * Tests for useTheme hook
 * Validates theme state management with localStorage persistence
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { CONFIG_DEFAULTS, THEMES } from '../../constants';
import { storageService, themeService } from '../../services';

jest.mock('../../services/storageService');
jest.mock('../../services/themeService');

const mockedStorageService = storageService as jest.Mocked<typeof storageService>;
const mockedThemeService = themeService as jest.Mocked<typeof themeService>;

describe('useTheme hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Default mock implementations
    mockedStorageService.getTheme.mockReturnValue(CONFIG_DEFAULTS.DEFAULT_THEME);
    mockedThemeService.toggleTheme.mockImplementation((current) =>
      current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    );
    mockedThemeService.isDarkMode.mockImplementation((theme) =>
      theme === THEMES.DARK
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should return default theme on mount', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(CONFIG_DEFAULTS.DEFAULT_THEME);

      // Act
      const { result } = renderHook(() => useTheme());

      // Assert
      expect(result.current[0]).toBe(CONFIG_DEFAULTS.DEFAULT_THEME);
    });

    it('should retrieve theme from storage on mount', () => {
      // Arrange
      const savedTheme = THEMES.LIGHT;
      mockedStorageService.getTheme.mockReturnValue(savedTheme);

      // Act
      renderHook(() => useTheme());

      // Assert
      expect(mockedStorageService.getTheme).toHaveBeenCalledWith(
        CONFIG_DEFAULTS.DEFAULT_THEME
      );
    });

    it('should use provided initial theme', () => {
      // Arrange
      const customTheme = THEMES.LIGHT;
      mockedStorageService.getTheme.mockReturnValue(customTheme);

      // Act
      renderHook(() => useTheme(customTheme));

      // Assert
      expect(mockedStorageService.getTheme).toHaveBeenCalledWith(customTheme);
    });

    it('should return theme, toggleTheme, and isDarkMode functions', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);

      // Act
      const { result } = renderHook(() => useTheme());

      // Assert
      expect(result.current).toHaveLength(3);
      expect(typeof result.current[0]).toBe('string'); // theme
      expect(typeof result.current[1]).toBe('function'); // toggleTheme
      expect(typeof result.current[2]).toBe('boolean'); // isDarkMode
    });

    it('should initialize isDarkMode based on initial theme', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.isDarkMode.mockReturnValue(true);

      // Act
      const { result } = renderHook(() => useTheme());

      // Assert
      expect(result.current[2]).toBe(true);
    });
  });

  describe('toggleTheme', () => {
    it('should toggle theme state', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.toggleTheme.mockReturnValue(THEMES.LIGHT);

      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current[1](); // Call toggleTheme
      });

      // Assert
      // The theme should have changed via toggleTheme
      expect(mockedThemeService.toggleTheme).toHaveBeenCalled();
    });

    it('should toggle from dark to light', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.toggleTheme.mockImplementation(() => THEMES.LIGHT);

      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current[1](); // Call toggleTheme
      });

      // Assert
      expect(mockedThemeService.toggleTheme).toHaveBeenCalledWith(THEMES.DARK);
    });

    it('should toggle from light to dark', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.LIGHT);
      mockedThemeService.toggleTheme.mockImplementation(() => THEMES.DARK);

      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current[1](); // Call toggleTheme
      });

      // Assert
      expect(mockedThemeService.toggleTheme).toHaveBeenCalledWith(THEMES.LIGHT);
    });

    it('should persist theme after toggle', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.toggleTheme.mockReturnValue(THEMES.LIGHT);

      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current[1](); // Call toggleTheme
      });

      // Assert
      expect(mockedStorageService.saveTheme).toHaveBeenCalled();
    });

    it('should be callable multiple times', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.toggleTheme
        .mockReturnValueOnce(THEMES.LIGHT)
        .mockReturnValueOnce(THEMES.DARK)
        .mockReturnValueOnce(THEMES.LIGHT);

      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current[1]();
        result.current[1]();
        result.current[1]();
      });

      // Assert
      expect(mockedThemeService.toggleTheme).toHaveBeenCalledTimes(3);
    });
  });

  describe('isDarkMode', () => {
    it('should return true when theme is dark', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.isDarkMode.mockReturnValue(true);

      // Act
      const { result } = renderHook(() => useTheme());

      // Assert
      expect(result.current[2]).toBe(true);
    });

    it('should return false when theme is light', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.LIGHT);
      mockedThemeService.isDarkMode.mockReturnValue(false);

      // Act
      const { result } = renderHook(() => useTheme());

      // Assert
      expect(result.current[2]).toBe(false);
    });

    it('should update after theme toggle', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.isDarkMode
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      mockedThemeService.toggleTheme.mockReturnValue(THEMES.LIGHT);

      const { result } = renderHook(() => useTheme());
      expect(result.current[2]).toBe(true);

      // Act
      act(() => {
        result.current[1]();
      });

      // Assert
      expect(mockedThemeService.isDarkMode).toHaveBeenCalledTimes(2);
    });
  });

  describe('theme persistence', () => {
    it('should save theme to storage when theme changes', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.toggleTheme.mockReturnValue(THEMES.LIGHT);

      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current[1]();
      });

      // Assert
      expect(mockedStorageService.saveTheme).toHaveBeenCalled();
    });

    it('should load persisted theme on mount', () => {
      // Arrange
      const persistedTheme = THEMES.LIGHT;
      mockedStorageService.getTheme.mockReturnValue(persistedTheme);

      // Act
      const { result } = renderHook(() => useTheme());

      // Assert
      expect(result.current[0]).toBe(persistedTheme);
    });

    it('should apply theme to document on change', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.toggleTheme.mockReturnValue(THEMES.LIGHT);
      mockedThemeService.applyTheme = jest.fn();

      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current[1]();
      });

      // Assert
      expect(mockedThemeService.applyTheme).toHaveBeenCalled();
    });
  });

  describe('hook return values', () => {
    it('should return array with three elements', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);

      // Act
      const { result } = renderHook(() => useTheme());

      // Assert
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current.length).toBe(3);
    });

    it('should return stable function references', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);

      const { result, rerender } = renderHook(() => useTheme());
      const toggleThemeFn1 = result.current[1];

      // Act
      rerender();

      // Assert
      expect(result.current[1]).toBe(toggleThemeFn1);
    });

    it('should maintain proper return order', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.isDarkMode.mockReturnValue(true);

      // Act
      const { result } = renderHook(() => useTheme());
      const [theme, toggleTheme, isDarkMode] = result.current;

      // Assert
      expect(typeof theme).toBe('string');
      expect(typeof toggleTheme).toBe('function');
      expect(typeof isDarkMode).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid consecutive toggles', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.toggleTheme
        .mockReturnValueOnce(THEMES.LIGHT)
        .mockReturnValueOnce(THEMES.DARK)
        .mockReturnValueOnce(THEMES.LIGHT)
        .mockReturnValueOnce(THEMES.DARK);

      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        for (let i = 0; i < 4; i++) {
          result.current[1]();
        }
      });

      // Assert
      expect(mockedThemeService.toggleTheme).toHaveBeenCalledTimes(4);
    });

    it('should handle undefined initial theme', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(CONFIG_DEFAULTS.DEFAULT_THEME);

      // Act
      const { result } = renderHook(() => useTheme());

      // Assert
      expect(result.current[0]).toBeDefined();
    });

    it('should handle storage service errors gracefully', () => {
      // Arrange
      mockedStorageService.getTheme.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Act & Assert
      expect(() => {
        renderHook(() => useTheme());
      }).not.toThrow();
    });
  });

  describe('integration: complete theme workflow', () => {
    it('should complete save, load, and toggle workflow', () => {
      // Arrange
      mockedStorageService.getTheme.mockReturnValue(THEMES.DARK);
      mockedThemeService.toggleTheme.mockReturnValue(THEMES.LIGHT);
      mockedThemeService.isDarkMode
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      // Act
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current[1]();
      });

      // Assert
      expect(mockedStorageService.getTheme).toHaveBeenCalled();
      expect(mockedThemeService.toggleTheme).toHaveBeenCalled();
      expect(mockedStorageService.saveTheme).toHaveBeenCalled();
    });
  });
});
