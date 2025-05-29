import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a custom Supabase client with autoRefreshToken set to false
export const createCustomSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
}

// Create a singleton instance
export const customSupabaseClient = createCustomSupabaseClient()
