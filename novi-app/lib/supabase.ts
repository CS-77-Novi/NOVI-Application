// Import the createClient function from the Supabase JavaScript library
import { createClient } from '@supabase/supabase-js'

// Retrieve the Supabase project URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Retrieve the Supabase anonymous key from environment variables
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Shared Supabase client — used by all API routes and client hooks.

// Initialize and export the Supabase client instance using the URL and key
export const supabase = createClient(supabaseUrl, supabaseAnonKey)