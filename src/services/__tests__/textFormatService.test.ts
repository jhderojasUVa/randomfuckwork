/**
 * Tests for textFormatService
 * Validates text formatting and font size calculations
 */

import { textFormatService } from '../textFormatService';
import { CONFIG_DEFAULTS } from '../../constants';

describe('textFormatService', () => {
  describe('calculateFontSize', () => {
    it('should return CSS properties with correct font size formula', () => {
      // Arrange
      const text = 'Hello';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.calculateFontSize(text, baseFontSize);

      // Assert
      expect(result).toEqual({
        fontSize: 'calc(100px - 5px)',
      });
    });

    it('should use default base font size when not provided', () => {
      // Arrange
      const text = 'Test';

      // Act
      const result = textFormatService.calculateFontSize(text);

      // Assert
      expect(result.fontSize).toBe(
        `calc(${CONFIG_DEFAULTS.BASE_FONT_SIZE}px - 4px)`
      );
    });

    it('should handle short text (1 character)', () => {
      // Arrange
      const text = 'A';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.calculateFontSize(text, baseFontSize);

      // Assert
      expect(result).toEqual({
        fontSize: 'calc(100px - 1px)',
      });
    });

    it('should handle long text', () => {
      // Arrange
      const text = 'This is a very long text string';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.calculateFontSize(text, baseFontSize);

      // Assert
      expect(result).toEqual({
        fontSize: 'calc(100px - 31px)',
      });
    });

    it('should handle empty text string', () => {
      // Arrange
      const text = '';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.calculateFontSize(text, baseFontSize);

      // Assert
      expect(result).toEqual({
        fontSize: 'calc(100px - 0px)',
      });
    });

    it('should handle text with special characters', () => {
      // Arrange
      const text = 'hello!@#$%^&*()';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.calculateFontSize(text, baseFontSize);

      // Assert
      expect(result).toEqual({
        fontSize: 'calc(100px - 15px)',
      });
    });

    it('should handle text with spaces', () => {
      // Arrange
      const text = 'hello world';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.calculateFontSize(text, baseFontSize);

      // Assert
      // "hello world" is 11 characters including the space
      expect(result).toEqual({
        fontSize: 'calc(100px - 11px)',
      });
    });

    it('should handle unicode characters correctly', () => {
      // Arrange
      const text = '你好';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.calculateFontSize(text, baseFontSize);

      // Assert
      expect(result).toEqual({
        fontSize: 'calc(100px - 2px)',
      });
    });

    it('should accept different base font sizes', () => {
      // Arrange
      const text = 'Test';

      // Act
      const result50 = textFormatService.calculateFontSize(text, 50);
      const result150 = textFormatService.calculateFontSize(text, 150);

      // Assert
      expect(result50).toEqual({
        fontSize: 'calc(50px - 4px)',
      });
      expect(result150).toEqual({
        fontSize: 'calc(150px - 4px)',
      });
    });

    it('should handle zero base font size', () => {
      // Arrange
      const text = 'Test';
      const baseFontSize = 0;

      // Act
      const result = textFormatService.calculateFontSize(text, baseFontSize);

      // Assert
      expect(result).toEqual({
        fontSize: 'calc(0px - 4px)',
      });
    });

    it('should return object with only fontSize property', () => {
      // Arrange
      const text = 'Test';

      // Act
      const result = textFormatService.calculateFontSize(text);

      // Assert
      expect(Object.keys(result)).toEqual(['fontSize']);
    });

    it('should be consistent with multiple calls for same input', () => {
      // Arrange
      const text = 'Consistent';
      const baseFontSize = 100;

      // Act
      const result1 = textFormatService.calculateFontSize(
        text,
        baseFontSize
      );
      const result2 = textFormatService.calculateFontSize(
        text,
        baseFontSize
      );

      // Assert
      expect(result1).toEqual(result2);
    });
  });

  describe('getFontSizeValue', () => {
    it('should return numeric font size value', () => {
      // Arrange
      const text = 'Hello';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.getFontSizeValue(text, baseFontSize);

      // Assert
      expect(result).toBe(95); // 100 - 5
      expect(typeof result).toBe('number');
    });

    it('should use default base font size when not provided', () => {
      // Arrange
      const text = 'Test';

      // Act
      const result = textFormatService.getFontSizeValue(text);

      // Assert
      expect(result).toBe(CONFIG_DEFAULTS.BASE_FONT_SIZE - 4);
    });

    it('should handle short text', () => {
      // Arrange
      const text = 'A';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.getFontSizeValue(text, baseFontSize);

      // Assert
      expect(result).toBe(99); // 100 - 1
    });

    it('should handle empty text string', () => {
      // Arrange
      const text = '';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.getFontSizeValue(text, baseFontSize);

      // Assert
      expect(result).toBe(100); // 100 - 0
    });

    it('should handle long text', () => {
      // Arrange
      const text = 'This is a longer text';
      const baseFontSize = 100;

      // Act
      const result = textFormatService.getFontSizeValue(text, baseFontSize);

      // Assert
      expect(result).toBe(79); // 100 - 21
    });

    it('should handle different base font sizes', () => {
      // Arrange
      const text = 'Test';

      // Act
      const result50 = textFormatService.getFontSizeValue(text, 50);
      const result150 = textFormatService.getFontSizeValue(text, 150);

      // Assert
      expect(result50).toBe(46); // 50 - 4
      expect(result150).toBe(146); // 150 - 4
    });

    it('should return negative value if text is longer than base size', () => {
      // Arrange
      const text = 'This is a very long text string';
      const baseFontSize = 20;

      // Act
      const result = textFormatService.getFontSizeValue(text, baseFontSize);

      // Assert
      expect(result).toBeLessThan(0); // 20 - 31 = -11
      expect(result).toBe(-11);
    });

    it('should return zero when text length equals base size', () => {
      // Arrange
      const text = '1234';
      const baseFontSize = 4;

      // Act
      const result = textFormatService.getFontSizeValue(text, baseFontSize);

      // Assert
      expect(result).toBe(0);
    });

    it('should be consistent with multiple calls for same input', () => {
      // Arrange
      const text = 'Consistent';
      const baseFontSize = 100;

      // Act
      const result1 = textFormatService.getFontSizeValue(text, baseFontSize);
      const result2 = textFormatService.getFontSizeValue(text, baseFontSize);

      // Assert
      expect(result1).toEqual(result2);
    });
  });

  describe('integration: calculateFontSize and getFontSizeValue', () => {
    it('should match calculated size with formula size', () => {
      // Arrange
      const text = 'Integration Test';
      const baseFontSize = 100;

      // Act
      const cssStyle = textFormatService.calculateFontSize(text, baseFontSize);
      const numericValue = textFormatService.getFontSizeValue(
        text,
        baseFontSize
      );

      // Assert
      // Extract the numeric value from the calc formula
      // Format: "calc(100px - 16px)" => should equal 84
      expect(cssStyle.fontSize).toContain(`${baseFontSize}px`);
      expect(cssStyle.fontSize).toContain(`${text.length}px`);
      expect(numericValue).toBe(baseFontSize - text.length);
    });

    it('should produce matching results for various inputs', () => {
      // Arrange
      const testCases = [
        { text: 'a', base: 100 },
        { text: 'hello', base: 80 },
        { text: '', base: 120 },
        { text: 'x', base: 50 },
      ];

      // Act & Assert
      testCases.forEach(({ text, base }) => {
        const numericValue = textFormatService.getFontSizeValue(text, base);
        expect(numericValue).toBe(base - text.length);
      });
    });
  });
});
