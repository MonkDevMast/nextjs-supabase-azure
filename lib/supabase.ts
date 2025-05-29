import {
  createBrowserClient as createBrowserClientSSR,
  createServerClient as createServerClientSSR,
} from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Create a singleton instance for direct use
let supabaseClientInstance: ReturnType<typeof createBrowserClientSSR<Database>> | null = null

// Browser client (for client components)
export const createBrowserClient = () => {
  if (typeof window === "undefined") {
    // We're on the server, create a new instance
    return createBrowserClientSSR<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    )
  }

  // We're on the client, use the singleton
  if (!supabaseClientInstance) {
    supabaseClientInstance = createBrowserClientSSR<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    )
  }

  return supabaseClientInstance
}

// Export the singleton instance
export const supabaseClient = createBrowserClient()

// For backward compatibility with any code using createClientBrowserClient
export const createClientBrowserClient = () => {
  return createBrowserClient()
}

// For backward compatibility with any code using createClientSupabaseClient
export const createClientSupabaseClient = () => {
  return createBrowserClient()
}

// For backward compatibility with any code using createBrowserSupabaseClient
export const createBrowserSupabaseClient = () => {
  return createBrowserClient()
}

// Server client (for server components)
export const createServerSupabaseClient = () => {
  // Dynamically import cookies from next/headers only in server context
  // This prevents the error when imported in pages/ directory
  if (typeof window === "undefined") {
    // We're on the server
    const { cookies } = require("next/headers")
    const cookieStore = cookies()

    return createServerClientSSR<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set({ name, value, ...options }))
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )
  } else {
    // We're on the client, return the browser client instead
    console.warn("createServerSupabaseClient was called on the client side. Using browser client instead.")
    return createBrowserClient()
  }
}

// Server component Supabase client - only import this in server components
export const createServerComponentClient = async () => {
  if (typeof window === "undefined") {
    // We're on the server
    const { cookies } = require("next/headers")
    const cookieStore = cookies()

    return createServerClientSSR<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set({ name, value, ...options }))
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )
  } else {
    // We're on the client, return the browser client instead
    console.warn("createServerComponentClient was called on the client side. Using browser client instead.")
    return createBrowserClient()
  }
}
