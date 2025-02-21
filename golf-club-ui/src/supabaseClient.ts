import { createClient } from '@supabase/supabase-js'
import { config } from './config'

console.log('Supabase Configuration:', {
  hasUrl: !!config.SUPABASE_URL,
  hasKey: !!config.SUPABASE_ANON_KEY,
  url: config.SUPABASE_URL
});

if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
  console.error('Supabase Configuration Error:', {
    hasUrl: !!config.SUPABASE_URL,
    hasKey: !!config.SUPABASE_ANON_KEY
  });
  throw new Error('Missing Supabase URL or Anon Key');
}

// Create a more robust storage implementation
const customStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('Storage access failed:', e);
      }
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('Storage write failed:', e);
      }
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Storage remove failed:', e);
      }
    }
  }
};

export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: customStorage,
    storageKey: 'supabase.auth.token'
  }
});

// Single connection test
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection failed:', error);
  } else {
    console.log('Supabase connection successful');
  }
});

console.log('SUPABASE_URL (supabaseClient.ts):', config.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY (supabaseClient.ts):', config.SUPABASE_ANON_KEY);

// Add navigation helper
export const navigateAfterAuth = () => {
  try {
    window.location.href = '/home';
  } catch (e) {
    console.error('Navigation failed:', e);
  }
};
