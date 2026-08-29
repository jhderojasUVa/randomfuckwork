/* eslint-disable */
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders FUCK text', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/FUCK/i);
  expect(linkElement).toBeInTheDocument();
});
