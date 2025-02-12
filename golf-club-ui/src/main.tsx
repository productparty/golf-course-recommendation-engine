import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { supabase } from './supabaseClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Extra logging for initialization in main.tsx
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Initial Supabase getSession result:', { data, error });
  if (error) {
    console.error('Initial Supabase auth error:', error);
  }
}).catch(err => {
  console.error('Initial Supabase auth error (catch):', err);
});
