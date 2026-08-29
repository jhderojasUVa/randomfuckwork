/**
 * DataSourceToggle Component
 * Provides a clickable toggle for switching between Wikipedia and internal data sources
 */

import React, { useCallback } from 'react';
import type { ClickHandler } from '../../types';

/**
 * Props for the DataSourceToggle component
 */
interface DataSourceToggleProps {
  /** Current theme value for styling */
  theme: string;
  /** Label text to display (e.g., 'Wikipedia' or 'Internal') */
  label: string;
  /** Callback when toggle is clicked */
  onToggle: () => void;
}

/**
 * DataSourceToggle Component
 * Clickable button to toggle between Wikipedia and internal data sources
 * Displays the data source label with theme-specific styling
 *
 * @param props - Component props
 * @returns The rendered data source toggle element
 *
 * @example
 * <DataSourceToggle
 *   theme={theme}
 *   label={dataSourceLabel}
 *   onToggle={toggleDataSource}
 * />
 */
export const DataSourceToggle: React.FC<DataSourceToggleProps> = ({
  theme,
  label,
  onToggle,
}): React.ReactElement => {
  /**
   * Handles the click event and calls the onToggle callback
   */
  const handleClick: ClickHandler<HTMLDivElement> = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      e.preventDefault();
      onToggle();
    },
    [onToggle]
  );

  return (
    <div className="App-where" onClick={handleClick}>
      <p className={theme}>{label}</p>
    </div>
  );
};
