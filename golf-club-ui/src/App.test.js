import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import the Jest DOM matchers
import App from './App';

test('renders Golf Course Finder heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Golf Course Finder/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders ZIP Code input', () => {
  render(<App />);
  const zipCodeInput = screen.getByPlaceholderText(/Enter ZIP code/i);
  expect(zipCodeInput).toBeInTheDocument();
});

test('renders Search button', () => {
  render(<App />);
  const searchButton = screen.getByText(/Search/i);
  expect(searchButton).toBeInTheDocument();
});
