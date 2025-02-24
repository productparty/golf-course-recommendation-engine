import { createClient } from '@supabase/supabase-js'
import { config } from './config'

if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration')
}

export const supabase = createClient(
  config.SUPABASE_URL || '',
  config.SUPABASE_ANON_KEY || ''
)
