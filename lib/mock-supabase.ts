import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a mock Supabase client that gracefully fails
export const createMockSupabaseClient = (): SupabaseClient<Database> => {
  const errorMessage = "Supabase client not properly initialized"

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error(errorMessage) }),
      signInWithPassword: () =>
        Promise.resolve({ data: { user: null, session: null }, error: new Error(errorMessage) }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error(errorMessage) }),
      signOut: () => Promise.resolve({ error: new Error(errorMessage) }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
    },
    from: () => ({
      select: () => ({ data: null, error: new Error(errorMessage) }),
      insert: () => ({ data: null, error: new Error(errorMessage) }),
      update: () => ({ data: null, error: new Error(errorMessage) }),
      delete: () => ({ data: null, error: new Error(errorMessage) }),
    }),
  } as unknown as SupabaseClient<Database>
}
