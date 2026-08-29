/**
 * AppContainer Component
 * Main layout wrapper that orchestrates the layout structure
 */

import React from 'react';
import { MenuBar } from '../MenuBar/MenuBar';
import { Header } from '../Header/Header';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

/**
 * Props for the AppContainer component
 */
interface AppContainerProps {
  /** Current theme value ('dark' or 'light') */
  theme: string;
  /** Label for theme toggle (e.g., 'DARK mode') */
  themeLabel: string;
  /** Callback when theme toggle is clicked */
  onToggleTheme: () => void;
  /** Label for data source toggle (e.g., 'Wikipedia') */
  dataSourceLabel: string;
  /** Callback when data source toggle is clicked */
  onToggleDataSource: () => void;
  /** Text to display in the header */
  displayText: string;
  /** CSS style object for dynamic font sizing */
  headerStyle?: React.CSSProperties;
  /** CSS class for header element */
  headerClass: string;
  /** Callback when header is clicked */
  onHeaderClick: () => void;
  /** Whether data is currently loading */
  isLoading: boolean;
}

/**
 * AppContainer Component
 * Main layout wrapper that organizes all main components
 * Provides the overall structure and positioning for:
 * - Menu bar (top-right)
 * - Header with display text (center)
 * - Loading spinner (bottom-right)
 *
 * @param props - Component props
 * @returns The rendered app container
 *
 * @example
 * <AppContainer
 *   theme={theme}
 *   themeLabel={themeLabel}
 *   onToggleTheme={toggleTheme}
 *   dataSourceLabel={dataSourceLabel}
 *   onToggleDataSource={toggleDataSource}
 *   displayText={randomText}
 *   headerStyle={fontSize}
 *   headerClass={appClass}
 *   onHeaderClick={refetch}
 *   isLoading={isLoading}
 * />
 */
export const AppContainer: React.FC<AppContainerProps> = ({
  theme,
  themeLabel,
  onToggleTheme,
  dataSourceLabel,
  onToggleDataSource,
  displayText,
  headerStyle,
  headerClass,
  onHeaderClick,
  isLoading,
}): React.ReactElement => {
  return (
    <div className="App">
      {/* Menu bar with toggles */}
      <MenuBar
        theme={theme}
        themeLabel={themeLabel}
        onToggleTheme={onToggleTheme}
        dataSourceLabel={dataSourceLabel}
        onToggleDataSource={onToggleDataSource}
      />

      {/* Main display area */}
      <Header
        className={headerClass}
        displayText={displayText}
        style={headerStyle}
        onClick={onHeaderClick}
      />

      {/* Loading spinner */}
      <LoadingSpinner isLoading={isLoading} />
    </div>
  );
};
