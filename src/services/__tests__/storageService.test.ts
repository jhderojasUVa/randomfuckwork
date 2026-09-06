/**
 * Tests for storageService
 * Validates localStorage operations for theme and data source preferences
 */

import { storageService } from '../storageService';
import { STORAGE_KEYS, CONFIG_DEFAULTS } from '../../constants';

describe('storageService', () => {
  // Setup and cleanup
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('saveTheme', () => {
    it('should save theme to localStorage with correct key', () => {
      // Arrange
      const themeName = 'dark';

      // Act
      storageService.saveTheme(themeName);

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe(themeName);
    });

    it('should overwrite existing theme preference', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');

      // Act
      storageService.saveTheme('dark');

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
    });

    it('should handle multiple consecutive saves', () => {
      // Arrange & Act
      storageService.saveTheme('dark');
      storageService.saveTheme('light');
      storageService.saveTheme('dark');

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
    });

    it('should handle edge case: empty theme string', () => {
      // Arrange & Act
      storageService.saveTheme('');

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('');
    });

    it('should handle edge case: localStorage full or unavailable', () => {
      // Arrange
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      storageService.saveTheme('dark');

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save theme preference:',
        expect.any(Error)
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getTheme', () => {
    it('should retrieve theme from localStorage', () => {
      // Arrange
      const savedTheme = 'light';
      localStorage.setItem(STORAGE_KEYS.THEME, savedTheme);

      // Act
      const result = storageService.getTheme('dark');

      // Assert
      expect(result).toBe(savedTheme);
    });

    it('should return default theme if nothing stored', () => {
      // Arrange
      const defaultTheme = 'dark';

      // Act
      const result = storageService.getTheme(defaultTheme);

      // Assert
      expect(result).toBe(defaultTheme);
    });

    it('should return default theme on empty localStorage', () => {
      // Arrange
      const defaultTheme = CONFIG_DEFAULTS.DEFAULT_THEME;
      localStorage.setItem(STORAGE_KEYS.THEME, '');

      // Act
      const result = storageService.getTheme(defaultTheme);

      // Assert
      expect(result).toBe(defaultTheme);
    });

    it('should handle localStorage unavailable', () => {
      // Arrange
      const defaultTheme = 'dark';
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = storageService.getTheme(defaultTheme);

      // Assert
      expect(result).toBe(defaultTheme);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to retrieve theme preference:',
        expect.any(Error)
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveDataSource', () => {
    it('should save data source to localStorage with correct key', () => {
      // Arrange
      const dataSource = 'wikipedia';

      // Act
      storageService.saveDataSource(dataSource);

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.DATA_TYPE)).toBe(dataSource);
    });

    it('should overwrite existing data source preference', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEYS.DATA_TYPE, 'array');

      // Act
      storageService.saveDataSource('wikipedia');

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.DATA_TYPE)).toBe('wikipedia');
    });

    it('should handle edge case: empty data source string', () => {
      // Arrange & Act
      storageService.saveDataSource('');

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.DATA_TYPE)).toBe('');
    });

    it('should handle localStorage unavailable', () => {
      // Arrange
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      storageService.saveDataSource('wikipedia');

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save data source preference:',
        expect.any(Error)
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getDataSource', () => {
    it('should retrieve data source from localStorage', () => {
      // Arrange
      const savedSource = 'wikipedia';
      localStorage.setItem(STORAGE_KEYS.DATA_TYPE, savedSource);

      // Act
      const result = storageService.getDataSource('array');

      // Assert
      expect(result).toBe(savedSource);
    });

    it('should return default data source if nothing stored', () => {
      // Arrange
      const defaultSource = 'array';

      // Act
      const result = storageService.getDataSource(defaultSource);

      // Assert
      expect(result).toBe(defaultSource);
    });

    it('should return default data source on empty localStorage', () => {
      // Arrange
      const defaultSource = 'array';
      localStorage.setItem(STORAGE_KEYS.DATA_TYPE, '');

      // Act
      const result = storageService.getDataSource(defaultSource);

      // Assert
      expect(result).toBe(defaultSource);
    });

    it('should handle localStorage unavailable', () => {
      // Arrange
      const defaultSource = 'array';
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = storageService.getDataSource(defaultSource);

      // Assert
      expect(result).toBe(defaultSource);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to retrieve data source preference:',
        expect.any(Error)
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearPreferences', () => {
    it('should remove both theme and data source preferences', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      localStorage.setItem(STORAGE_KEYS.DATA_TYPE, 'wikipedia');

      // Act
      storageService.clearPreferences();

      // Assert
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.DATA_TYPE)).toBeNull();
    });

    it('should not throw error when clearing empty storage', () => {
      // Act & Assert
      expect(() => storageService.clearPreferences()).not.toThrow();
    });

    it('should handle localStorage unavailable', () => {
      // Arrange
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      storageService.clearPreferences();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('integration: save and retrieve flow', () => {
    it('should persist and retrieve theme correctly', () => {
      // Arrange
      const theme = 'light';

      // Act
      storageService.saveTheme(theme);
      const retrieved = storageService.getTheme('dark');

      // Assert
      expect(retrieved).toBe(theme);
    });

    it('should persist and retrieve data source correctly', () => {
      // Arrange
      const source = 'wikipedia';

      // Act
      storageService.saveDataSource(source);
      const retrieved = storageService.getDataSource('array');

      // Assert
      expect(retrieved).toBe(source);
    });

    it('should maintain separate storage for theme and data source', () => {
      // Arrange
      const theme = 'light';
      const source = 'wikipedia';

      // Act
      storageService.saveTheme(theme);
      storageService.saveDataSource(source);

      // Assert
      expect(storageService.getTheme('dark')).toBe(theme);
      expect(storageService.getDataSource('array')).toBe(source);
    });
  });
});
