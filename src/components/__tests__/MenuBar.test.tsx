/**
 * Tests for MenuBar component
 * Validates menu bar layout and prop passing
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MenuBar } from '../MenuBar/MenuBar';

// Mock child components
interface MockThemeToggleProps {
  theme: string;
  label: string;
}

interface MockDataSourceToggleProps {
  theme: string;
  label: string;
}

jest.mock('../MenuBar/ThemeToggle', () => ({
  ThemeToggle: ({ theme, label }: MockThemeToggleProps) => (
    <div data-testid="theme-toggle">
      ThemeToggle: {theme}, {label}
    </div>
  ),
}));

jest.mock('../MenuBar/DataSourceToggle', () => ({
  DataSourceToggle: ({ theme, label }: MockDataSourceToggleProps) => (
    <div data-testid="data-source-toggle">
      DataSourceToggle: {theme}, {label}
    </div>
  ),
}));

describe('MenuBar', () => {
  const defaultProps = {
    theme: 'dark',
    themeLabel: 'DARK mode',
    onToggleTheme: jest.fn(),
    dataSourceLabel: 'Internal',
    onToggleDataSource: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render MenuBar component', () => {
      // Act
      render(<MenuBar {...defaultProps} />);

      // Assert
      expect(document.querySelector('.App-menu')).toBeInTheDocument();
    });

    it('should render ThemeToggle component', () => {
      // Act
      render(<MenuBar {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render DataSourceToggle component', () => {
      // Act
      render(<MenuBar {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('data-source-toggle')).toBeInTheDocument();
    });

    it('should render both toggle components', () => {
      // Act
      render(<MenuBar {...defaultProps} />);

      // Assert
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('data-source-toggle')).toBeInTheDocument();
    });
  });

  describe('props passing', () => {
    it('should pass theme to ThemeToggle', () => {
      // Act
      render(<MenuBar {...defaultProps} theme="light" />);

      // Assert
      expect(screen.getByTestId('theme-toggle')).toHaveTextContent('light');
    });

    it('should pass themeLabel to ThemeToggle', () => {
      // Act
      render(<MenuBar {...defaultProps} themeLabel="LIGHT mode" />);

      // Assert
      expect(screen.getByTestId('theme-toggle')).toHaveTextContent('LIGHT mode');
    });

    it('should pass theme to DataSourceToggle', () => {
      // Act
      render(<MenuBar {...defaultProps} theme="light" />);

      // Assert
      expect(screen.getByTestId('data-source-toggle')).toHaveTextContent('light');
    });

    it('should pass dataSourceLabel to DataSourceToggle', () => {
      // Act
      render(<MenuBar {...defaultProps} dataSourceLabel="Wikipedia" />);

      // Assert
      expect(screen.getByTestId('data-source-toggle')).toHaveTextContent('Wikipedia');
    });

    it('should pass onToggleTheme callback', () => {
      // Arrange
      const mockToggleTheme = jest.fn();

      // Act
      render(<MenuBar {...defaultProps} onToggleTheme={mockToggleTheme} />);

      // Assert
      expect(mockToggleTheme).not.toHaveBeenCalled();
    });

    it('should pass onToggleDataSource callback', () => {
      // Arrange
      const mockToggleDataSource = jest.fn();

      // Act
      render(<MenuBar {...defaultProps} onToggleDataSource={mockToggleDataSource} />);

      // Assert
      expect(mockToggleDataSource).not.toHaveBeenCalled();
    });
  });

  describe('CSS classes', () => {
    it('should have App-menu class', () => {
      // Act
      render(<MenuBar {...defaultProps} />);

      // Assert
      expect(document.querySelector('.App-menu')).toBeInTheDocument();
    });

    it('should be a container with flexbox layout', () => {
      // Act
      render(<MenuBar {...defaultProps} />);

      // Assert
      const menu = document.querySelector('.App-menu');
      expect(menu).toBeInTheDocument();
    });
  });

  describe('component ordering', () => {
    it('should render DataSourceToggle before ThemeToggle', () => {
      // Act
      const { container } = render(<MenuBar {...defaultProps} />);

      // Assert
      const menuChildren = container.querySelector('.App-menu')?.children;
      expect(menuChildren?.[0]).toHaveAttribute('data-testid', 'data-source-toggle');
      expect(menuChildren?.[1]).toHaveAttribute('data-testid', 'theme-toggle');
    });
  });

  describe('edge cases', () => {
    it('should handle theme switching', () => {
      // Arrange
      const { rerender } = render(<MenuBar {...defaultProps} theme="dark" />);

      // Act
      rerender(<MenuBar {...defaultProps} theme="light" />);

      // Assert
      expect(screen.getByTestId('theme-toggle')).toHaveTextContent('light');
      expect(screen.getByTestId('data-source-toggle')).toHaveTextContent('light');
    });

    it('should handle label updates', () => {
      // Arrange
      const { rerender } = render(<MenuBar {...defaultProps} dataSourceLabel="Internal" />);

      // Act
      rerender(<MenuBar {...defaultProps} dataSourceLabel="Wikipedia" />);

      // Assert
      expect(screen.getByTestId('data-source-toggle')).toHaveTextContent('Wikipedia');
    });

    it('should handle empty labels', () => {
      // Act
      render(<MenuBar {...defaultProps} themeLabel="" dataSourceLabel="" />);

      // Assert
      expect(document.querySelector('.App-menu')).toBeInTheDocument();
    });
  });
});
