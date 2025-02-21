import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import your main App component
import { debugApiConfig } from './utils/api';

// Debug API configuration in development
if (import.meta.env.DEV) {
  debugApiConfig();
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  root.innerHTML = '<div style="color: red; padding: 20px;">Failed to load application. Please refresh the page.</div>';
}
