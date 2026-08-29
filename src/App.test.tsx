/**
 * Comprehensive tests for the App component
 * Covers happy path, error scenarios, and edge cases
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('App Component', () => {
  /**
   * Setup: Reset mocks before each test
   */
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Happy Path Tests
   */
  describe('Happy Path - Initial Load', () => {
    it('should render without crashing', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: 'life' }, { string: 'love' }],
      });

      render(<App />);
      await waitFor(() => {
        expect(screen.getByRole('heading')).toBeInTheDocument();
      });
    });

    it('should fetch and display data on mount', async () => {
      const mockData = [{ string: 'life' }, { string: 'love' }, { string: 'work' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      render(<App />);

      await waitFor(() => {
        const textContent = screen.getByRole('heading').textContent || '';
        const hasMatch = mockData.some(item => textContent.includes(item.string));
        expect(hasMatch).toBeTruthy();
      });
    });

    it('should display FUCK as the prefix text', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: 'life' }],
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/FUCK/i)).toBeInTheDocument();
      });
    });

    it('should display Internal as default data source', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: 'test' }],
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Internal')).toBeInTheDocument();
      });
    });

    it('should display dark mode as default theme', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: 'test' }],
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/DARK/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * Theme Toggle Tests
   */
  describe('Theme Toggle - Light/Dark Mode', () => {
    it('should toggle from dark to light mode when mode button is clicked', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: 'test' }],
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/DARK/i)).toBeInTheDocument();
      });

      const modeButton = screen.getByText(/DARK/i).parentElement;
      fireEvent.click(modeButton!);

      await waitFor(() => {
        expect(screen.getByText(/LIGHT/i)).toBeInTheDocument();
      });
    });

    it('should apply correct theme class to header', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: 'test' }],
      });

      render(<App />);

      const header = await screen.findByRole('heading');
      await waitFor(() => {
        expect(header.className).toContain('dark');
      });
    });
  });

  /**
   * Data Source Toggle Tests
   */
  describe('Data Source Toggle - Internal vs Wikipedia', () => {
    it('should toggle from Internal to Wikipedia source', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: 'test' }],
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Internal')).toBeInTheDocument();
      });

      const sourceButton = screen.getByText('Internal').parentElement;
      fireEvent.click(sourceButton!);

      mockedAxios.get.mockResolvedValueOnce({
        data: { title: 'Wikipedia Article Title' },
      });

      await waitFor(() => {
        expect(screen.getByText('Wikipedia')).toBeInTheDocument();
      });
    });
  });

  /**
   * Page Reload Tests
   */
  describe('Page Reload - Fetch Fresh Data', () => {
    it('should fetch new data when main text is clicked', async () => {
      const mockData = [{ string: 'word1' }, { string: 'word2' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      render(<App />);

      const mainText = await screen.findByRole('heading');
      fireEvent.click(mainText);

      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Error Handling - Network Failures', () => {
    it('should handle fetch error gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('heading')).toBeInTheDocument();
      });
    });
  });

  /**
   * UI Interaction Tests
   */
  describe('UI Interactions - User Actions', () => {
    it('should display loading image with correct alt text', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: 'test' }],
      });

      render(<App />);

      const loadingImg = screen.getByAltText(/loading/i);
      expect(loadingImg).toBeInTheDocument();
    });
  });

  /**
   * Edge Cases Tests
   */
  describe('Edge Cases - Boundary Conditions', () => {
    it('should handle empty data array', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('heading')).toBeInTheDocument();
      });
    });

    it('should handle very long word strings', async () => {
      const longWord = 'a'.repeat(100);
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: longWord }],
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(longWord))).toBeInTheDocument();
      });
    });

    it('should handle special characters in words', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ string: 'café-naïve_@#$%' }],
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/café/i)).toBeInTheDocument();
      });
    });
  });
});
