/**
 * Test suite for App component
 * Tests core functionality and rendering
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import App from './App';

/**
 * Test: App component renders with FUCK text
 * Verifies that the main heading text is displayed
 */
test('renders FUCK text', () => {
  const { getByText }: RenderResult = render(<App />);
  const linkElement: HTMLElement = getByText(/FUCK/i);
  expect(linkElement).toBeInTheDocument();
});
