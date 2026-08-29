/**
 * Main application component
 * Displays random words/definitions with theme and data source controls
 * Uses refactored components and custom hooks for state management
 */

import React from 'react';
import './App.css';
import { AppContainer } from './components/Container/AppContainer';
import { useAppState } from './hooks/useAppState';

/**
 * Main App component
 * Coordinator component that orchestrates state and passes props to child components
 * Uses custom hooks to manage theme, data, and computed values
 * Delegates rendering to AppContainer and its child components
 *
 * @returns The rendered React component
 */
const App: React.FC = (): React.ReactElement => {
  // Get all app state and control methods from custom hook
  const {
    theme,
    toggleTheme,
    themeLabel,
    isLoading,
    dataSourceLabel,
    toggleDataSource,
    refetch,
    randomText,
    fontSize,
    appClass,
  } = useAppState();

  return (
    <AppContainer
      theme={theme}
      themeLabel={themeLabel}
      onToggleTheme={toggleTheme}
      dataSourceLabel={dataSourceLabel}
      onToggleDataSource={toggleDataSource}
      displayText={randomText}
      headerStyle={fontSize}
      headerClass={appClass}
      onHeaderClick={refetch}
      isLoading={isLoading}
    />
  );
};

export default App;
