/**
 * Application-specific types and interfaces
 */

import type { DataType, ArrayItem } from './common.types';

/**
 * Application configuration constants
 */
export interface AppConfig {
  /** Base URL for API requests */
  apiBaseUrl: string;
  /** Local storage key for persisting preferences */
  storageKey: string;
  /** Debounce delay in milliseconds for operations */
  debounceMs: number;
}

/**
 * Application state interface
 * Represents the complete state of the application
 */
export interface AppState {
  /** Current data items being displayed */
  currentData: ArrayItem[];
  /** Currently selected data source type */
  selectedDataType: DataType;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error message if any operation failed (null if no error) */
  error: string | null;
  /** Dark mode enabled state */
  isDarkMode: boolean;
  /** Current font size in pixels or relative unit */
  fontSize: number;
}

/**
 * Context value type for AppContext
 * Provides state and dispatch methods to child components
 */
export interface AppContextValue {
  /** Current application state */
  state: AppState;
  /** Update state with new values */
  setState: (state: Partial<AppState>) => void;
  /** Fetch data from the selected source */
  fetchData: () => Promise<void>;
  /** Toggle between data sources */
  toggleDataSource: () => Promise<void>;
  /** Toggle dark/light theme */
  toggleTheme: () => void;
  /** Update font size */
  setFontSize: (size: number) => void;
}

/**
 * Properties for the App component
 */
export interface AppProps {
  /** Optional configuration overrides */
  config?: Partial<AppConfig>;
}
