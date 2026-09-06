/**
 * LoadingSpinner Component
 * Displays an animated loading spinner during data fetch operations
 */

import React, { useMemo } from 'react';
import { ASSETS, VISIBILITY_CLASSES } from '../../constants';

/**
 * Props for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
  /** Whether the spinner should be visible */
  isLoading: boolean;
}

/**
 * LoadingSpinner Component
 * Displays a loading spinner image with CSS-controlled visibility
 * Uses CSS transitions for smooth fade in/out effects
 *
 * @param props - Component props
 * @returns The rendered loading spinner
 *
 * @example
 * <LoadingSpinner isLoading={isLoading} />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  isLoading,
}): React.ReactElement => {
  /**
   * Determines the visibility CSS class based on loading state
   */
  const visibilityClass = useMemo(
    (): string =>
      isLoading ? VISIBILITY_CLASSES.VISIBLE : VISIBILITY_CLASSES.HIDDEN,
    [isLoading]
  );

  return (
    <div className="App-loading">
      <img
        className={visibilityClass}
        src={ASSETS.LOADING_GIF}
        width={ASSETS.LOADING_SIZE}
        alt={ASSETS.LOADING_ALT}
      />
    </div>
  );
};
