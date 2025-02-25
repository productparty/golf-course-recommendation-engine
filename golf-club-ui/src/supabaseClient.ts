import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Check for required configuration
if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration. Authentication will not work.')
}

// Declare supabase client variable
let supabaseClient: any;

// Create client with error handling
try {
  supabaseClient = createClient(
    config.SUPABASE_URL || '',
    config.SUPABASE_ANON_KEY || ''
  )
  
  // Test the connection in development
  if (import.meta.env.DEV) {
    supabaseClient.auth.getSession().then(({ data }: { data: { session: any } }) => {
      console.log('Supabase connection test:', data.session ? 'Connected' : 'No active session')
    }).catch((err: Error) => {
      console.error('Supabase connection test failed:', err)
    })
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
  // Provide a fallback client that will gracefully fail
  supabaseClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not initialized') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  } as any
}

// Export the client
export const supabase = supabaseClient;
