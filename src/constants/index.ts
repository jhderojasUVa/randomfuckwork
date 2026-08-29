/**
 * Application constants and magic strings
 * Extracted from the application code for reusability and maintainability
 */

/**
 * Data source type constants
 */
export const DATA_TYPES = {
  /** Internal array data source */
  ARRAY: 'array',
  /** Wikipedia data source */
  WIKIPEDIA: 'wikipedia',
} as const;

/**
 * Theme/color constants
 */
export const THEMES = {
  /** Dark theme identifier */
  DARK: 'dark',
  /** Light theme identifier */
  LIGHT: 'light',
} as const;

/**
 * Local storage keys for persisting user preferences
 */
export const STORAGE_KEYS = {
  /** Storage key for theme preference */
  THEME: 'theme-preference',
  /** Storage key for data source preference */
  DATA_TYPE: 'data-source-preference',
} as const;

/**
 * API endpoints used by the application
 */
export const API_ENDPOINTS = {
  /** Wikipedia REST API for random page summary */
  WIKIPEDIA_RANDOM: 'https://en.wikipedia.org/api/rest_v1/page/random/summary',
  /** Internal JSON data storage */
  INTERNAL_DATA: 'storage/arraystorage.json',
} as const;

/**
 * CSS class names for visibility control
 */
export const VISIBILITY_CLASSES = {
  /** CSS class when element should be visible */
  VISIBLE: 'visibilityYes',
  /** CSS class when element should be hidden */
  HIDDEN: 'visibilityNo',
} as const;

/**
 * Image assets and paths
 */
export const ASSETS = {
  /** Loading spinner image path */
  LOADING_GIF: 'images/loading.gif',
  /** Loading spinner alt text */
  LOADING_ALT: 'loading... please wait!',
  /** Loading spinner size in pixels */
  LOADING_SIZE: 100,
} as const;

/**
 * UI text constants
 */
export const UI_TEXT = {
  /** Text prefix for main display */
  TEXT_PREFIX: 'FUCK',
  /** Loading state text */
  LOADING_TEXT: 'loading...',
  /** Internal data source display name */
  INTERNAL_SOURCE_NAME: 'Internal',
  /** Wikipedia data source display name */
  WIKIPEDIA_SOURCE_NAME: 'Wikipedia',
  /** Dark mode suffix */
  MODE_SUFFIX: 'mode',
} as const;

/**
 * Application configuration defaults
 */
export const CONFIG_DEFAULTS = {
  /** Default base font size in pixels */
  BASE_FONT_SIZE: 100,
  /** Default debounce delay in milliseconds */
  DEBOUNCE_MS: 300,
  /** Default theme on first load */
  DEFAULT_THEME: THEMES.DARK,
  /** Default data source on first load */
  DEFAULT_DATA_SOURCE: DATA_TYPES.ARRAY,
} as const;
