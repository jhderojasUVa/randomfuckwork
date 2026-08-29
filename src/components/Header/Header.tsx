/**
 * Header Component
 * Displays the main content (random word/title) with clickable text
 */

import React, { useCallback } from 'react';
import { UI_TEXT } from '../../constants';
import type { ClickHandler } from '../../types';

/**
 * Props for the Header component
 */
interface HeaderProps {
  /** CSS class for styling the header */
  className: string;
  /** Text to display as the main content */
  displayText: string;
  /** CSS style object for dynamic font sizing */
  style?: React.CSSProperties;
  /** Callback when the header text is clicked */
  onClick: () => void;
}

/**
 * Header Component
 * Displays the random word/Wikipedia title as clickable text
 * Combines a prefix (usually "FUCK") with the main display text
 * Uses dynamic font sizing based on text length
 *
 * @param props - Component props
 * @returns The rendered header element
 *
 * @example
 * <Header
 *   className="App-header dark"
 *   displayText="Word"
 *   style={{ fontSize: '98px' }}
 *   onClick={handleClick}
 * />
 */
export const Header: React.FC<HeaderProps> = ({
  className,
  displayText,
  style,
  onClick,
}): React.ReactElement => {
  /**
   * Handles click events on the header
   */
  const handleClick: ClickHandler<HTMLParagraphElement> = useCallback(
    (e: React.MouseEvent<HTMLParagraphElement>): void => {
      e.preventDefault();
      onClick();
    },
    [onClick]
  );

  return (
    <header className={className}>
      <p onClick={handleClick} style={style}>
        {UI_TEXT.TEXT_PREFIX} <strong>{displayText}</strong>
      </p>
    </header>
  );
};
