/**
 * MenuBar Component
 * Container for theme and data source toggle controls
 */

import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { DataSourceToggle } from './DataSourceToggle';

/**
 * Props for the MenuBar component
 */
interface MenuBarProps {
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
}

/**
 * MenuBar Component
 * Container component that displays both theme and data source toggles
 * Positioned in the top-right corner with flexbox layout
 *
 * @param props - Component props
 * @returns The rendered menu bar
 *
 * @example
 * <MenuBar
 *   theme={theme}
 *   themeLabel={themeLabel}
 *   onToggleTheme={toggleTheme}
 *   dataSourceLabel={dataSourceLabel}
 *   onToggleDataSource={toggleDataSource}
 * />
 */
export const MenuBar: React.FC<MenuBarProps> = ({
  theme,
  themeLabel,
  onToggleTheme,
  dataSourceLabel,
  onToggleDataSource,
}): React.ReactElement => {
  return (
    <div className="App-menu">
      {/* Data source toggle */}
      <DataSourceToggle
        theme={theme}
        label={dataSourceLabel}
        onToggle={onToggleDataSource}
      />

      {/* Theme toggle */}
      <ThemeToggle
        theme={theme}
        label={themeLabel}
        onToggle={onToggleTheme}
      />
    </div>
  );
};
