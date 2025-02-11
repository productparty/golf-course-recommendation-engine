import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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