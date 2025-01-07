import React from 'react';
import ReactDOM from 'react-dom/client';
import GolfCourseApp from './GolfCourseApp'; // Import your GolfCourseApp component
import './index.css'; // Import global styles (if you have a CSS file)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement // TypeScript-specific type assertion
);

root.render(
  <React.StrictMode>
    <GolfCourseApp />
  </React.StrictMode>
);