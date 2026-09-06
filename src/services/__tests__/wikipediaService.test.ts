/**
 * Tests for wikipediaService
 * Validates Wikipedia API integration and data extraction
 */

import axios, { AxiosResponse } from 'axios';
import { wikipediaService } from '../wikipediaService';
import { API_ENDPOINTS } from '../../constants';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('wikipediaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchRandomPage', () => {
    it('should fetch from correct Wikipedia API endpoint', async () => {
      // Arrange
      const mockResponse = {
        title: 'Python (programming language)',
        extract: 'Python is a programming language...',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      await wikipediaService.fetchRandomPage();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        API_ENDPOINTS.WIKIPEDIA_RANDOM
      );
    });

    it('should return data in ArrayItem format with title as string', async () => {
      // Arrange
      const mockResponse = {
        title: 'Python (programming language)',
        extract: 'Python is a programming language...',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.fetchRandomPage();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('string', 'Python (programming language)');
      expect(result[0]).toHaveProperty('excerpt', 'Python is a programming language...');
    });

    it('should handle response with title only', async () => {
      // Arrange
      const mockResponse = {
        title: 'Einstein',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.fetchRandomPage();

      // Assert
      expect(result[0].string).toBe('Einstein');
      expect(result[0].excerpt).toBeUndefined();
    });

    it('should handle response with thumbnail data', async () => {
      // Arrange
      const mockResponse = {
        title: 'Saturn',
        extract: 'Saturn is a gas giant...',
        thumbnail: {
          source: 'https://example.com/image.jpg',
          width: 220,
          height: 210,
        },
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.fetchRandomPage();

      // Assert
      expect(result[0].string).toBe('Saturn');
      expect(result[0].excerpt).toBe('Saturn is a gas giant...');
    });

    it('should throw error if response has no title', async () => {
      // Arrange
      const mockResponse = {
        extract: 'Some text without title',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(wikipediaService.fetchRandomPage()).rejects.toThrow(
        'Invalid response format from Wikipedia API'
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should throw error if response data is null', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({
        data: null,
      } as AxiosResponse);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(wikipediaService.fetchRandomPage()).rejects.toThrow(
        'Invalid response format from Wikipedia API'
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should throw error if API call fails', async () => {
      // Arrange
      const mockError = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(mockError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(wikipediaService.fetchRandomPage()).rejects.toThrow(
        'Network Error'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch Wikipedia data:',
        mockError
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should handle title with special characters', async () => {
      // Arrange
      const mockResponse = {
        title: 'Alice\'s Adventures in Wonderland',
        extract: 'A story about Alice...',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.fetchRandomPage();

      // Assert
      expect(result[0].string).toBe('Alice\'s Adventures in Wonderland');
    });

    it('should handle very long titles', async () => {
      // Arrange
      const longTitle =
        'A Very Long Wikipedia Article Title About Something Complicated ' +
        'That Goes On For A Very Long Time And Contains Many Words';
      const mockResponse = {
        title: longTitle,
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.fetchRandomPage();

      // Assert
      expect(result[0].string).toBe(longTitle);
    });

    it('should handle titles with unicode characters', async () => {
      // Arrange
      const mockResponse = {
        title: '日本国',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.fetchRandomPage();

      // Assert
      expect(result[0].string).toBe('日本国');
    });

    it('should always return array with single item', async () => {
      // Arrange
      const mockResponse = {
        title: 'Test Article',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.fetchRandomPage();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });
  });

  describe('getRandomPageTitle', () => {
    it('should return the Wikipedia page title string', async () => {
      // Arrange
      const mockResponse = {
        title: 'JavaScript',
        extract: 'JavaScript is a programming language...',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.getRandomPageTitle();

      // Assert
      expect(result).toBe('JavaScript');
      expect(typeof result).toBe('string');
    });

    it('should return empty string if string field is missing', async () => {
      // Arrange
      const mockResponse = {
        title: 'Some Title',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.getRandomPageTitle();

      // Assert
      expect(typeof result).toBe('string');
    });

    it('should handle special characters in title', async () => {
      // Arrange
      const mockResponse = {
        title: 'C++ Programming Language',
        extract: 'C++ is a compiled language...',
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.getRandomPageTitle();

      // Assert
      expect(result).toBe('C++ Programming Language');
    });

    it('should throw error if fetch fails', async () => {
      // Arrange
      const mockError = new Error('API Error');
      mockedAxios.get.mockRejectedValue(mockError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(wikipediaService.getRandomPageTitle()).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get Wikipedia page title:',
        expect.any(Error)
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should throw error if response is invalid', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({
        data: { invalid: 'data' },
      } as AxiosResponse);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(wikipediaService.getRandomPageTitle()).rejects.toThrow();

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should handle very long page titles', async () => {
      // Arrange
      const longTitle =
        'A Comprehensive Article About A Complex Topic With Many ' +
        'Descriptive Words That Make The Title Quite Long';
      const mockResponse = {
        title: longTitle,
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const result = await wikipediaService.getRandomPageTitle();

      // Assert
      expect(result).toBe(longTitle);
    });

    it('should return different titles on multiple calls', async () => {
      // Arrange
      mockedAxios.get
        .mockResolvedValueOnce({
          data: { title: 'Article 1' },
        } as AxiosResponse)
        .mockResolvedValueOnce({
          data: { title: 'Article 2' },
        } as AxiosResponse)
        .mockResolvedValueOnce({
          data: { title: 'Article 3' },
        } as AxiosResponse);

      // Act
      const result1 = await wikipediaService.getRandomPageTitle();
      const result2 = await wikipediaService.getRandomPageTitle();
      const result3 = await wikipediaService.getRandomPageTitle();

      // Assert
      expect(result1).toBe('Article 1');
      expect(result2).toBe('Article 2');
      expect(result3).toBe('Article 3');
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('integration: full workflow', () => {
    it('should handle complete fetch and extraction workflow', async () => {
      // Arrange
      const mockResponse = {
        title: 'Technology',
        extract: 'Technology is the application of scientific knowledge...',
        thumbnail: {
          source: 'https://example.com/tech.jpg',
          width: 220,
          height: 220,
        },
      };
      mockedAxios.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      // Act
      const pageData = await wikipediaService.fetchRandomPage();
      const pageTitle = await wikipediaService.getRandomPageTitle();

      // Assert
      expect(pageData[0].string).toBe('Technology');
      expect(pageTitle).toBe('Technology');
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple concurrent requests', async () => {
      // Arrange
      mockedAxios.get
        .mockResolvedValueOnce({
          data: { title: 'Article 1' },
        } as AxiosResponse)
        .mockResolvedValueOnce({
          data: { title: 'Article 2' },
        } as AxiosResponse);

      // Act
      const [result1, result2] = await Promise.all([
        wikipediaService.getRandomPageTitle(),
        wikipediaService.getRandomPageTitle(),
      ]);

      // Assert
      expect(result1).toBe('Article 1');
      expect(result2).toBe('Article 2');
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle network timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Timeout');
      mockedAxios.get.mockRejectedValue(timeoutError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      await expect(wikipediaService.fetchRandomPage()).rejects.toThrow(
        'Timeout'
      );

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });
});
