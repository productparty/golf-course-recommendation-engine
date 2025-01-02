import React from 'react';
import { render, screen } from '@testing-library/react';
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

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
