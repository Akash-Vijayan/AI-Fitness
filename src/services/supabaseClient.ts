import { createClient } from '@supabase/supabase-js'

// These values come from your Supabase project and should be in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
