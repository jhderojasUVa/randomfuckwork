/**
 * Main application component
 * Displays random words/definitions with theme and data source controls
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios, { AxiosResponse } from 'axios';
import './App.css';
import type { ArrayItem, ClickHandler, DataType } from './types';
import {
  DATA_TYPES,
  THEMES,
  API_ENDPOINTS,
  VISIBILITY_CLASSES,
  ASSETS,
  UI_TEXT,
  CONFIG_DEFAULTS,
} from './constants';

/**
 * Props for the App component
 */
interface AppProps {
  /** Optional initial data source type */
  initialDataType?: DataType;
  /** Optional initial theme */
  initialTheme?: string;
}

/**
 * Main App component
 * Manages state for data display, theming, and data sources
 * @param props - Component props
 * @returns The rendered React component
 */
const App: React.FC<AppProps> = ({
  initialDataType = DATA_TYPES.ARRAY,
  initialTheme = CONFIG_DEFAULTS.DEFAULT_THEME,
}): React.ReactElement => {
  // ============================================================
  // State Management
  // ============================================================

  /** Array of data items (words/definitions) */
  const [data, setData] = useState<ArrayItem[]>([]);

  /** Current theme ('dark' or 'light') */
  const [color, setColor] = useState<string>(initialTheme);

  /** Whether Wikipedia data source is active */
  const [wikipedia, setWikipedia] = useState<boolean>(
    initialDataType === DATA_TYPES.WIKIPEDIA
  );

  /** Whether data is currently loading */
  const [isLoading, setLoading] = useState<boolean>(false);

  // ============================================================
  // Async Data Fetching
  // ============================================================

  /**
   * Fetches Wikipedia data for a random page
   * Sets loading state and updates data on success
   * @returns Promise that resolves when fetch completes
   */
  const fechWikiPediaData = useCallback(async (): Promise<void> => {
    try {
      const response: AxiosResponse<{
        title: string;
        extract?: string;
      }> = await axios.get(API_ENDPOINTS.WIKIPEDIA_RANDOM);

      const stringTitle: ArrayItem = { string: response.data.title };
      setData([stringTitle]);
    } catch (error) {
      console.error('Failed to fetch Wikipedia data:', error);
      setData([{ string: UI_TEXT.LOADING_TEXT }]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches data from internal JSON storage
   * @returns Promise that resolves when fetch completes
   */
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      const response: AxiosResponse<ArrayItem[]> = await axios.get(
        API_ENDPOINTS.INTERNAL_DATA
      );
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch internal data:', error);
      setData([]);
    }
  }, []);

  /**
   * Determines which data source to fetch from and loads data
   */
  const reDo = useCallback((): void => {
    if (wikipedia) {
      setLoading(true);
      void fechWikiPediaData();
    } else {
      void fetchData();
    }
  }, [wikipedia, fechWikiPediaData, fetchData]);

  // ============================================================
  // Event Handlers
  // ============================================================

  /**
   * Handles page reload/refresh action
   * Fetches fresh data from the current source
   */
  const pageReload: ClickHandler = useCallback((): void => {
    reDo();
  }, [reDo]);

  /**
   * Toggles between Wikipedia and internal data sources
   */
  const changeFrom: ClickHandler = useCallback((): void => {
    setWikipedia((prev) => !prev);
  }, []);

  /**
   * Toggles between dark and light theme
   */
  const changeMode: ClickHandler = useCallback((): void => {
    setColor((prev) =>
      prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    );
  }, []);

  // ============================================================
  // Effects
  // ============================================================

  /**
   * Initialize app on mount - fetch initial data
   */
  useEffect(() => {
    reDo();
  }, [reDo]);

  /**
   * Reload data when Wikipedia source is toggled
   */
  useEffect(() => {
    reDo();
  }, [wikipedia, reDo]);

  // ============================================================
  // Computed Values
  // ============================================================

  /**
   * Select a random word or return Wikipedia title
   * @returns The text to display
   */
  const randomData = useMemo((): string => {
    if (data.length > 0 && !wikipedia) {
      // Get random item from array
      const randomItem = data[Math.floor(Math.random() * data.length)];
      return randomItem.string || randomItem.word || '';
    }
    if (wikipedia && data.length > 0) {
      // Use first item (Wikipedia title)
      return data[0].string || '';
    }
    if (isLoading) {
      return UI_TEXT.LOADING_TEXT;
    }
    return '';
  }, [data, wikipedia, isLoading]);

  /**
   * Determine visibility CSS class for loading spinner
   * @returns CSS class name for visibility
   */
  const isVisible = useMemo(
    (): string =>
      isLoading ? VISIBILITY_CLASSES.VISIBLE : VISIBILITY_CLASSES.HIDDEN,
    [isLoading]
  );

  /**
   * Combine theme class with App-header base class
   * @returns Full className for header element
   */
  const appClass = useMemo((): string => `App-header ${color}`, [color]);

  /**
   * Calculate dynamic font size based on text length
   * Smaller text gets bigger font size
   * @returns CSS style object with calculated font size
   */
  const fontSize = useMemo(
    (): React.CSSProperties => ({
      fontSize: `calc(${CONFIG_DEFAULTS.BASE_FONT_SIZE}px - ${randomData.length}px)`,
    }),
    [randomData.length]
  );

  /**
   * Get the label for current data source
   * @returns Display name for current source
   */
  const dataSourceLabel = useMemo(
    (): string =>
      wikipedia ? UI_TEXT.WIKIPEDIA_SOURCE_NAME : UI_TEXT.INTERNAL_SOURCE_NAME,
    [wikipedia]
  );

  /**
   * Get the label for current theme
   * @returns Display name for current theme
   */
  const themeLabel = useMemo(
    (): string => `${color.toUpperCase()} ${UI_TEXT.MODE_SUFFIX}`,
    [color]
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="App">
      {/* Menu bar with data source and theme toggles */}
      <div className="App-menu">
        {/* Data source toggle */}
        <div className="App-where" onClick={changeFrom}>
          <p className={color}>{dataSourceLabel}</p>
        </div>

        {/* Theme toggle */}
        <div className="App-mode" onClick={changeMode}>
          <p className={color}>{themeLabel}</p>
        </div>
      </div>

      {/* Main display area with clickable text */}
      <header className={appClass}>
        <p onClick={pageReload} style={fontSize}>
          {UI_TEXT.TEXT_PREFIX} <strong>{randomData}</strong>
        </p>
      </header>

      {/* Loading spinner */}
      <div className="App-loading">
        <img
          className={isVisible}
          src={ASSETS.LOADING_GIF}
          width={ASSETS.LOADING_SIZE}
          alt={ASSETS.LOADING_ALT}
        />
      </div>
    </div>
  );
};

export default App;
