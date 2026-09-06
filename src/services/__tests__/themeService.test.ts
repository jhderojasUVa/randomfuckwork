/**
 * Tests for themeService
 * Validates theme management and persistence operations
 */

import { themeService } from '../themeService';
import { storageService } from '../storageService';
import { THEMES } from '../../constants';

jest.mock('../storageService');
const mockedStorageService = storageService as jest.Mocked<typeof storageService>;

describe('themeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the data-theme attribute for each test
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    jest.restoreAllMocks();
  });

  describe('toggleTheme', () => {
    it('should toggle from dark to light theme', () => {
      // Arrange
      const currentTheme = THEMES.DARK;

      // Act
      const newTheme = themeService.toggleTheme(currentTheme);

      // Assert
      expect(newTheme).toBe(THEMES.LIGHT);
    });

    it('should toggle from light to dark theme', () => {
      // Arrange
      const currentTheme = THEMES.LIGHT;

      // Act
      const newTheme = themeService.toggleTheme(currentTheme);

      // Assert
      expect(newTheme).toBe(THEMES.DARK);
    });

    it('should save new theme to storage', () => {
      // Arrange
      const currentTheme = THEMES.DARK;

      // Act
      themeService.toggleTheme(currentTheme);

      // Assert
      expect(mockedStorageService.saveTheme).toHaveBeenCalledWith(THEMES.LIGHT);
    });

    it('should handle invalid theme gracefully', () => {
      // Arrange
      const invalidTheme = 'invalid-theme';

      // Act
      const newTheme = themeService.toggleTheme(invalidTheme);

      // Assert
      // Should default to light when not dark
      expect(newTheme).toBe(THEMES.DARK);
    });

    it('should persist toggled theme', () => {
      // Arrange
      const currentTheme = THEMES.DARK;

      // Act
      themeService.toggleTheme(currentTheme);

      // Assert
      expect(mockedStorageService.saveTheme).toHaveBeenCalled();
    });

    it('should handle multiple consecutive toggles', () => {
      // Arrange
      let currentTheme = THEMES.DARK;

      // Act
      currentTheme = themeService.toggleTheme(currentTheme);
      currentTheme = themeService.toggleTheme(currentTheme);
      currentTheme = themeService.toggleTheme(currentTheme);

      // Assert
      expect(currentTheme).toBe(THEMES.LIGHT);
      expect(mockedStorageService.saveTheme).toHaveBeenCalledTimes(3);
    });
  });

  describe('isDarkMode', () => {
    it('should return true for dark theme', () => {
      // Arrange
      const theme = THEMES.DARK;

      // Act
      const result = themeService.isDarkMode(theme);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for light theme', () => {
      // Arrange
      const theme = THEMES.LIGHT;

      // Act
      const result = themeService.isDarkMode(theme);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for invalid theme', () => {
      // Arrange
      const theme = 'invalid';

      // Act
      const result = themeService.isDarkMode(theme);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      // Arrange
      const theme = '';

      // Act
      const result = themeService.isDarkMode(theme);

      // Assert
      expect(result).toBe(false);
    });

    it('should be case-sensitive for dark', () => {
      // Arrange & Act
      const resultLowercase = themeService.isDarkMode('dark');
      const resultUppercase = themeService.isDarkMode('Dark');
      const resultCapitalized = themeService.isDarkMode('DARK');

      // Assert
      expect(resultLowercase).toBe(true);
      expect(resultUppercase).toBe(false);
      expect(resultCapitalized).toBe(false);
    });
  });

  describe('getOppositeTheme', () => {
    it('should return light theme for dark theme', () => {
      // Arrange
      const currentTheme = THEMES.DARK;

      // Act
      const opposite = themeService.getOppositeTheme(currentTheme);

      // Assert
      expect(opposite).toBe(THEMES.LIGHT);
    });

    it('should return dark theme for light theme', () => {
      // Arrange
      const currentTheme = THEMES.LIGHT;

      // Act
      const opposite = themeService.getOppositeTheme(currentTheme);

      // Assert
      expect(opposite).toBe(THEMES.DARK);
    });

    it('should handle invalid theme gracefully', () => {
      // Arrange
      const invalidTheme = 'invalid-theme';

      // Act
      const opposite = themeService.getOppositeTheme(invalidTheme);

      // Assert
      expect(opposite).toBe(THEMES.DARK);
    });

    it('should not modify the current theme parameter', () => {
      // Arrange
      const currentTheme = THEMES.DARK;

      // Act
      themeService.getOppositeTheme(currentTheme);

      // Assert
      expect(currentTheme).toBe(THEMES.DARK);
    });

    it('should handle empty string', () => {
      // Arrange
      const emptyTheme = '';

      // Act
      const opposite = themeService.getOppositeTheme(emptyTheme);

      // Assert
      expect(opposite).toBe(THEMES.DARK);
    });

    it('should be idempotent for double opposite', () => {
      // Arrange
      const originalTheme = THEMES.DARK;

      // Act
      const opposite1 = themeService.getOppositeTheme(originalTheme);
      const opposite2 = themeService.getOppositeTheme(opposite1);

      // Assert
      expect(opposite2).toBe(originalTheme);
    });
  });

  describe('applyTheme', () => {
    it('should set data-theme attribute on document element', () => {
      // Arrange
      const theme = THEMES.DARK;

      // Act
      themeService.applyTheme(theme);

      // Assert
      expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
    });

    it('should overwrite existing data-theme attribute', () => {
      // Arrange
      document.documentElement.setAttribute('data-theme', THEMES.LIGHT);
      const newTheme = THEMES.DARK;

      // Act
      themeService.applyTheme(newTheme);

      // Assert
      expect(document.documentElement.getAttribute('data-theme')).toBe(newTheme);
    });

    it('should handle switching between themes', () => {
      // Arrange & Act
      themeService.applyTheme(THEMES.DARK);
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        THEMES.DARK
      );

      themeService.applyTheme(THEMES.LIGHT);
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        THEMES.LIGHT
      );

      themeService.applyTheme(THEMES.DARK);

      // Assert
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        THEMES.DARK
      );
    });

    it('should handle empty theme string', () => {
      // Arrange & Act
      themeService.applyTheme('');

      // Assert
      expect(document.documentElement.getAttribute('data-theme')).toBe('');
    });

    it('should handle theme with special characters', () => {
      // Arrange
      const theme = 'dark-mode';

      // Act
      themeService.applyTheme(theme);

      // Assert
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        'dark-mode'
      );
    });

    it('should handle DOM error gracefully', () => {
      // Arrange
      jest
        .spyOn(document.documentElement, 'setAttribute')
        .mockImplementation(() => {
          throw new Error('DOM Error');
        });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      themeService.applyTheme(THEMES.DARK);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to apply theme:',
        expect.any(Error)
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should apply theme to html element not other elements', () => {
      // Arrange
      const theme = THEMES.DARK;

      // Act
      themeService.applyTheme(theme);

      // Assert
      expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
      expect(document.body.getAttribute('data-theme')).toBeNull();
    });
  });

  describe('integration: theme workflow', () => {
    it('should handle toggle and apply workflow', () => {
      // Arrange
      let currentTheme = THEMES.DARK;

      // Act
      currentTheme = themeService.toggleTheme(currentTheme);
      themeService.applyTheme(currentTheme);

      // Assert
      expect(currentTheme).toBe(THEMES.LIGHT);
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        THEMES.LIGHT
      );
    });

    it('should handle get opposite and apply workflow', () => {
      // Arrange
      const currentTheme = THEMES.DARK;

      // Act
      const opposite = themeService.getOppositeTheme(currentTheme);
      themeService.applyTheme(opposite);

      // Assert
      expect(opposite).toBe(THEMES.LIGHT);
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        THEMES.LIGHT
      );
    });

    it('should handle complete theme switching workflow', () => {
      // Arrange
      let theme = THEMES.DARK;

      // Act & Assert - Start with dark
      themeService.applyTheme(theme);
      expect(themeService.isDarkMode(theme)).toBe(true);

      // Toggle to light
      theme = themeService.toggleTheme(theme);
      themeService.applyTheme(theme);
      expect(themeService.isDarkMode(theme)).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        THEMES.LIGHT
      );

      // Toggle back to dark
      theme = themeService.toggleTheme(theme);
      themeService.applyTheme(theme);
      expect(themeService.isDarkMode(theme)).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        THEMES.DARK
      );
    });

    it('should verify storage is called on toggle', () => {
      // Arrange
      const currentTheme = THEMES.DARK;

      // Act
      themeService.toggleTheme(currentTheme);

      // Assert
      expect(mockedStorageService.saveTheme).toHaveBeenCalledWith(THEMES.LIGHT);
    });
  });
});
