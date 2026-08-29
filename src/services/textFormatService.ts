/**
 * Text Format Service
 * Handles text-related calculations such as dynamic font sizing
 */

import React from 'react';
import { CONFIG_DEFAULTS } from '../constants';

/**
 * Text format service for text calculations
 * Provides methods for calculating dynamic font sizes based on text length
 */
export const textFormatService = {
  /**
   * Calculates dynamic font size based on text length
   * Shorter text gets larger font size, longer text gets smaller font size
   *
   * Formula: BASE_FONT_SIZE - text.length (in pixels)
   * Example: "Hi" (2 chars) -> 100 - 2 = 98px
   * Example: "Hello World" (11 chars) -> 100 - 11 = 89px
   *
   * @param text - The text to calculate font size for
   * @param baseFontSize - The base font size in pixels (default: 100)
   * @returns CSS style object with calculated font size
   */
  calculateFontSize: (
    text: string,
    baseFontSize: number = CONFIG_DEFAULTS.BASE_FONT_SIZE
  ): React.CSSProperties => ({
    fontSize: `calc(${baseFontSize}px - ${text.length}px)`,
  }),

  /**
   * Gets the font size value in pixels
   * Useful for testing or getting the actual numeric value
   *
   * @param text - The text to calculate font size for
   * @param baseFontSize - The base font size in pixels (default: 100)
   * @returns The calculated font size as a number
   */
  getFontSizeValue: (
    text: string,
    baseFontSize: number = CONFIG_DEFAULTS.BASE_FONT_SIZE
  ): number => baseFontSize - text.length,
};
