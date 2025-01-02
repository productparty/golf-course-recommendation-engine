import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders golf course recommendation engine', () => {
  render(<App />);
  const headingElement = screen.getByText(/golf course recommendation engine/i);
  expect(headingElement).toBeInTheDocument();
});
