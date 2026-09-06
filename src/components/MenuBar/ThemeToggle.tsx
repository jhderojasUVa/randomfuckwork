/**
 * ThemeToggle Component
 * Provides a clickable toggle for switching between dark and light themes
 */

import React, { useCallback } from 'react';
import type { ClickHandler } from '../../types';

/**
 * Props for the ThemeToggle component
 */
interface ThemeToggleProps {
  /** Current theme value ('dark' or 'light') */
  theme: string;
  /** Label text to display */
  label: string;
  /** Callback when toggle is clicked */
  onToggle: () => void;
}

/**
 * ThemeToggle Component
 * Clickable button to toggle between dark and light themes
 * Displays the theme label with theme-specific styling
 *
 * @param props - Component props
 * @returns The rendered theme toggle element
 *
 * @example
 * <ThemeToggle
 *   theme={theme}
 *   label={themeLabel}
 *   onToggle={toggleTheme}
 * />
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
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
    <div className="App-mode" onClick={handleClick}>
      <p className={theme}>{label}</p>
    </div>
  );
};
