import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use the SAME custom storage as the main app.
const memoryStorage = new Map<string, string>();

const customStorage = {
    getItem: (key: string): string | null => {
        console.log('customStorage.getItem:', key);
        let value = memoryStorage.get(key) || null;
        console.log('memoryStorage.get result:', key, value);
        if (value) return value;
        try {
            console.log('Trying localStorage.getItem:', key);
            value = localStorage.getItem(key);
            console.log('localStorage.getItem result:', key, value);
            if (value !== null) {
                memoryStorage.set(key, value);
                return value;
            }
        } catch (e) {
            console.warn('localStorage.getItem failed (non-critical):', e);
        }
        try {
            console.log('Trying sessionStorage.getItem:', key);
            value = sessionStorage.getItem(key);
            console.log('sessionStorage.getItem result:', key, value);
            if (value !== null) {
                memoryStorage.set(key, value);
                return value;
            }
        } catch (e) {
            console.warn('sessionStorage.getItem failed (non-critical):', e);
        }
        return null;
    },
    setItem: (key: string, value: string) => {
        console.log('customStorage.setItem:', key, value);
        memoryStorage.set(key, value);
        try {
            console.log('Trying localStorage.setItem:', key, value);
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('localStorage.setItem failed (non-critical):', e);
        }
        try {
            console.log('Trying sessionStorage.setItem:', key, value);
            sessionStorage.setItem(key, value);
        } catch (e) {
            console.warn('sessionStorage.setItem failed (non-critical):', e);
        }
    },
    removeItem: (key: string) => {
        console.log('customStorage.removeItem:', key);
        memoryStorage.delete(key);
        try {
            console.log('Trying localStorage.removeItem:', key);
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('localStorage.removeItem failed (non-critical):', e);
        }
        try {
            console.log('Trying sessionStorage.removeItem:', key);
            sessionStorage.removeItem(key);
        } catch (e) {
            console.warn('sessionStorage.removeItem failed (non-critical):', e);
        }
    },
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: customStorage
  }
});

function App() {
  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase getSession result:', { data, error });
        if (error) {
          console.error('Supabase error:', error);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };
    init();
  }, []);

  return (
    <div>
      <h1>Supabase Test</h1>
      <p>Check the console for Supabase initialization results.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 