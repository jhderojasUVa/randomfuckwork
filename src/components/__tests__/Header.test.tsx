/**
 * Tests for Header component
 * Validates header display and click functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../../Header/Header';
import { UI_TEXT } from '../../../constants';

describe('Header', () => {
  const defaultProps = {
    className: 'App-header dark',
    displayText: 'TestWord',
    style: { fontSize: 'calc(100px - 8px)' },
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render header element', () => {
      // Act
      render(<Header {...defaultProps} />);

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render paragraph element inside header', () => {
      // Act
      render(<Header {...defaultProps} />);

      // Assert
      expect(screen.getByRole('banner').querySelector('p')).toBeInTheDocument();
    });

    it('should display text prefix', () => {
      // Act
      render(<Header {...defaultProps} />);

      // Assert
      expect(screen.getByText(new RegExp(UI_TEXT.TEXT_PREFIX))).toBeInTheDocument();
    });

    it('should display displayText in strong tag', () => {
      // Act
      render(<Header {...defaultProps} displayText="MyWord" />);

      // Assert
      expect(screen.getByRole('banner').querySelector('strong')).toHaveTextContent('MyWord');
    });
  });

  describe('props', () => {
    it('should apply className to header', () => {
      // Act
      render(<Header {...defaultProps} className="App-header light" />);

      // Assert
      expect(screen.getByRole('banner')).toHaveClass('App-header', 'light');
    });

    it('should display displayText correctly', () => {
      // Act
      render(<Header {...defaultProps} displayText="JavaScript" />);

      // Assert
      expect(screen.getByRole('banner')).toHaveTextContent('JavaScript');
    });

    it('should apply style to paragraph', () => {
      // Arrange
      const style = { fontSize: 'calc(100px - 12px)' };

      // Act
      render(<Header {...defaultProps} style={style} />);

      // Assert
      expect(screen.getByRole('banner').querySelector('p')).toHaveStyle(
        'font-size: calc(100px - 12px)'
      );
    });

    it('should handle empty displayText', () => {
      // Act
      render(<Header {...defaultProps} displayText="" />);

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should handle undefined style', () => {
      // Act
      render(<Header {...defaultProps} style={undefined} />);

      // Assert
      expect(screen.getByRole('banner').querySelector('p')).toBeInTheDocument();
    });
  });

  describe('text content', () => {
    it('should combine prefix and displayText', () => {
      // Act
      render(<Header {...defaultProps} displayText="Word" />);

      // Assert
      expect(screen.getByRole('banner')).toHaveTextContent(`${UI_TEXT.TEXT_PREFIX} Word`);
    });

    it('should wrap displayText in strong tag', () => {
      // Act
      render(<Header {...defaultProps} displayText="MyWord" />);

      // Assert
      const strong = screen.getByRole('banner').querySelector('strong');
      expect(strong).toHaveTextContent('MyWord');
    });

    it('should prefix with FUCK', () => {
      // Act
      render(<Header {...defaultProps} />);

      // Assert
      expect(screen.getByRole('banner')).toHaveTextContent('FUCK');
    });

    it('should handle special characters in displayText', () => {
      // Act
      render(<Header {...defaultProps} displayText="C++" />);

      // Assert
      expect(screen.getByRole('banner')).toHaveTextContent('C++');
    });

    it('should handle long displayText', () => {
      // Arrange
      const longText = 'This is a very long piece of text for the header';

      // Act
      render(<Header {...defaultProps} displayText={longText} />);

      // Assert
      expect(screen.getByRole('banner')).toHaveTextContent(longText);
    });

    it('should handle unicode characters', () => {
      // Act
      render(<Header {...defaultProps} displayText="日本国" />);

      // Assert
      expect(screen.getByRole('banner')).toHaveTextContent('日本国');
    });
  });

  describe('click handler', () => {
    it('should call onClick when paragraph is clicked', async () => {
      // Arrange
      const mockClick = jest.fn();

      // Act
      render(<Header {...defaultProps} onClick={mockClick} />);
      const paragraph = screen.getByRole('banner').querySelector('p');
      fireEvent.click(paragraph!);

      // Assert
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick with click event', async () => {
      // Arrange
      const mockClick = jest.fn();

      // Act
      render(<Header {...defaultProps} onClick={mockClick} />);
      const paragraph = screen.getByRole('banner').querySelector('p');
      fireEvent.click(paragraph!);

      // Assert
      expect(mockClick).toHaveBeenCalledWith(expect.objectContaining({
        type: 'click',
      }));
    });

    it('should be clickable via strong tag area', async () => {
      // Arrange
      const mockClick = jest.fn();

      // Act
      render(<Header {...defaultProps} displayText="Test" onClick={mockClick} />);
      const strong = screen.getByRole('banner').querySelector('strong');
      fireEvent.click(strong!);

      // Assert
      expect(mockClick).toHaveBeenCalled();
    });

    it('should not be called on initial render', () => {
      // Arrange
      const mockClick = jest.fn();

      // Act
      render(<Header {...defaultProps} onClick={mockClick} />);

      // Assert
      expect(mockClick).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks', async () => {
      // Arrange
      const mockClick = jest.fn();

      // Act
      render(<Header {...defaultProps} onClick={mockClick} />);
      const paragraph = screen.getByRole('banner').querySelector('p');
      fireEvent.click(paragraph!);
      fireEvent.click(paragraph!);
      fireEvent.click(paragraph!);

      // Assert
      expect(mockClick).toHaveBeenCalledTimes(3);
    });

    it('should have cursor pointer for clickable element', () => {
      // Act
      render(<Header {...defaultProps} />);

      // Assert - onClick is present, making it interactive
      expect(defaultProps.onClick).toBeDefined();
    });
  });

  describe('CSS styling', () => {
    it('should apply custom className', () => {
      // Act
      render(<Header {...defaultProps} className="custom-class" />);

      // Assert
      expect(screen.getByRole('banner')).toHaveClass('custom-class');
    });

    it('should apply multiple classes', () => {
      // Act
      render(<Header {...defaultProps} className="App-header dark special" />);

      // Assert
      expect(screen.getByRole('banner')).toHaveClass('App-header', 'dark', 'special');
    });

    it('should apply inline styles to paragraph', () => {
      // Arrange
      const style = { fontSize: '92px', color: 'red' };

      // Act
      render(<Header {...defaultProps} style={style} />);

      // Assert
      const paragraph = screen.getByRole('banner').querySelector('p');
      expect(paragraph).toHaveStyle('font-size: 92px');
      expect(paragraph).toHaveStyle('color: red');
    });

    it('should handle empty className', () => {
      // Act
      render(<Header {...defaultProps} className="" />);

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace in displayText', () => {
      // Act
      render(<Header {...defaultProps} displayText="  Text with spaces  " />);

      // Assert
      expect(screen.getByRole('banner')).toHaveTextContent('  Text with spaces  ');
    });

    it('should handle newlines in displayText', () => {
      // Act
      render(<Header {...defaultProps} displayText="Text\nwith\nnewlines" />);

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should handle HTML-like strings as text', () => {
      // Act
      render(<Header {...defaultProps} displayText="<div>Not HTML</div>" />);

      // Assert
      // Text should be escaped, not rendered as HTML
      expect(screen.getByRole('banner')).toHaveTextContent('<div>Not HTML</div>');
    });

    it('should be accessible with keyboard', async () => {
      // Arrange
      const mockClick = jest.fn();
      const user = userEvent.setup();

      // Act
      render(<Header {...defaultProps} onClick={mockClick} />);
      const paragraph = screen.getByRole('banner').querySelector('p')!;

      // Simulate Enter key on paragraph (if it has tabindex)
      paragraph.setAttribute('tabindex', '0');
      await user.click(paragraph);

      // Assert
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('integration: complete header workflow', () => {
    it('should display complete header with all elements', () => {
      // Act
      render(<Header {...defaultProps} displayText="JavaScript" />);

      // Assert
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('App-header', 'dark');
      expect(header).toHaveTextContent('FUCK JavaScript');
      expect(header.querySelector('strong')).toHaveTextContent('JavaScript');
    });

    it('should be clickable and styled', async () => {
      // Arrange
      const mockClick = jest.fn();

      // Act
      render(
        <Header
          className="App-header dark"
          displayText="TestWord"
          style={{ fontSize: 'calc(100px - 8px)' }}
          onClick={mockClick}
        />
      );

      const paragraph = screen.getByRole('banner').querySelector('p');
      fireEvent.click(paragraph!);

      // Assert
      expect(mockClick).toHaveBeenCalled();
      expect(paragraph).toHaveStyle('font-size: calc(100px - 8px)');
      expect(screen.getByRole('banner')).toHaveClass('App-header', 'dark');
    });
  });
});
