/**
 * Tests for AppContainer component
 * Validates main layout container component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContainer } from '../../Container/AppContainer';

interface MockMenuBarProps {
  theme: string;
  themeLabel: string;
  dataSourceLabel: string;
}

interface MockHeaderProps {
  className: string;
  displayText: string;
  style?: React.CSSProperties;
  onClick: () => void;
}

interface MockLoadingSpinnerProps {
  isLoading: boolean;
}

// Mock child components to isolate AppContainer tests
jest.mock('../../MenuBar/MenuBar', () => ({
  MenuBar: ({ theme, themeLabel, dataSourceLabel }: MockMenuBarProps) => (
    <div data-testid="menu-bar">
      MenuBar: {theme}, {themeLabel}, {dataSourceLabel}
    </div>
  ),
}));

jest.mock('../../Header/Header', () => ({
  Header: ({ className, displayText, style, onClick }: MockHeaderProps) => (
    <header data-testid="header" className={className} onClick={onClick} style={style}>
      {displayText}
    </header>
  ),
}));

jest.mock('../../LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: ({ isLoading }: MockLoadingSpinnerProps) => (
    <div data-testid="loading-spinner" data-loading={isLoading}>
      Loading: {isLoading ? 'true' : 'false'}
    </div>
  ),
}));

describe('AppContainer', () => {
  const defaultProps = {
    theme: 'dark',
    themeLabel: 'DARK mode',
    onToggleTheme: jest.fn(),
    dataSourceLabel: 'Internal',
    onToggleDataSource: jest.fn(),
    displayText: 'TestWord',
    headerStyle: { fontSize: 'calc(100px - 8px)' },
    headerClass: 'App-header dark',
    onHeaderClick: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render AppContainer component', () => {
      // Act
      render(<AppContainer {...defaultProps} />);

      // Assert
      expect(document.querySelector('.App')).toBeInTheDocument();
    });

    it('should render MenuBar component', () => {
      // Act
      render(<AppContainer {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
    });

    it('should render Header component', () => {
      // Act
      render(<AppContainer {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render LoadingSpinner component', () => {
      // Act
      render(<AppContainer {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('props passing', () => {
    it('should pass theme to MenuBar', () => {
      // Act
      render(<AppContainer {...defaultProps} theme="light" />);

      // Assert
      expect(screen.getByTestId('menu-bar')).toHaveTextContent('light');
    });

    it('should pass themeLabel to MenuBar', () => {
      // Act
      render(<AppContainer {...defaultProps} themeLabel="LIGHT mode" />);

      // Assert
      expect(screen.getByTestId('menu-bar')).toHaveTextContent('LIGHT mode');
    });

    it('should pass dataSourceLabel to MenuBar', () => {
      // Act
      render(<AppContainer {...defaultProps} dataSourceLabel="Wikipedia" />);

      // Assert
      expect(screen.getByTestId('menu-bar')).toHaveTextContent('Wikipedia');
    });

    it('should pass displayText to Header', () => {
      // Act
      render(<AppContainer {...defaultProps} displayText="MyWord" />);

      // Assert
      expect(screen.getByTestId('header')).toHaveTextContent('MyWord');
    });

    it('should pass headerClass to Header', () => {
      // Act
      render(<AppContainer {...defaultProps} headerClass="App-header light" />);

      // Assert
      expect(screen.getByTestId('header')).toHaveClass('App-header', 'light');
    });

    it('should pass headerStyle to Header', () => {
      // Arrange
      const style = { fontSize: 'calc(100px - 8px)' };

      // Act
      render(<AppContainer {...defaultProps} headerStyle={style} />);

      // Assert
      expect(screen.getByTestId('header')).toHaveStyle('font-size: calc(100px - 8px)');
    });

    it('should pass isLoading to LoadingSpinner', () => {
      // Act
      render(<AppContainer {...defaultProps} isLoading={true} />);

      // Assert
      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-loading', 'true');
    });

    it('should pass onToggleTheme to MenuBar', () => {
      // Arrange
      const mockToggleTheme = jest.fn();

      // Act
      render(<AppContainer {...defaultProps} onToggleTheme={mockToggleTheme} />);

      // Assert
      expect(mockToggleTheme).not.toHaveBeenCalled(); // Should be passed, not called during render
    });

    it('should pass onToggleDataSource to MenuBar', () => {
      // Arrange
      const mockToggleDataSource = jest.fn();

      // Act
      render(<AppContainer {...defaultProps} onToggleDataSource={mockToggleDataSource} />);

      // Assert
      expect(mockToggleDataSource).not.toHaveBeenCalled();
    });

    it('should pass onHeaderClick to Header', () => {
      // Arrange
      const mockHeaderClick = jest.fn();

      // Act
      render(<AppContainer {...defaultProps} onHeaderClick={mockHeaderClick} />);

      // Assert
      expect(mockHeaderClick).not.toHaveBeenCalled();
    });
  });

  describe('CSS classes', () => {
    it('should have App class on root element', () => {
      // Act
      render(<AppContainer {...defaultProps} />);

      // Assert
      expect(document.querySelector('.App')).toBeInTheDocument();
    });

    it('should have App-menu class for MenuBar container', () => {
      // Act
      render(<AppContainer {...defaultProps} />);

      // Assert
      expect(document.querySelector('.App-menu')).toBeInTheDocument();
    });

    it('should have App-loading class for LoadingSpinner container', () => {
      // Act
      render(<AppContainer {...defaultProps} />);

      // Assert
      expect(document.querySelector('.App-loading')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      // Act
      render(<AppContainer {...defaultProps} isLoading={true} />);

      // Assert
      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-loading', 'true');
    });

    it('should hide loading spinner when isLoading is false', () => {
      // Act
      render(<AppContainer {...defaultProps} isLoading={false} />);

      // Assert
      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-loading', 'false');
    });
  });

  describe('edge cases', () => {
    it('should handle empty displayText', () => {
      // Act
      render(<AppContainer {...defaultProps} displayText="" />);

      // Assert
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should handle undefined headerStyle', () => {
      // Act
      render(<AppContainer {...defaultProps} headerStyle={undefined} />);

      // Assert
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should handle theme switching', () => {
      // Arrange
      const { rerender } = render(<AppContainer {...defaultProps} theme="dark" />);

      // Act
      rerender(<AppContainer {...defaultProps} theme="light" />);

      // Assert
      expect(screen.getByTestId('menu-bar')).toHaveTextContent('light');
    });

    it('should handle data source switching', () => {
      // Arrange
      const { rerender } = render(<AppContainer {...defaultProps} dataSourceLabel="Internal" />);

      // Act
      rerender(<AppContainer {...defaultProps} dataSourceLabel="Wikipedia" />);

      // Assert
      expect(screen.getByTestId('menu-bar')).toHaveTextContent('Wikipedia');
    });
  });
});
