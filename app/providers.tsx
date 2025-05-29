"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { UserProvider } from "@/contexts/user-context"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { useState, useEffect } from "react"

// Simple component to check if environment variables are available
function EnvironmentCheck() {
  const [envStatus, setEnvStatus] = useState<"checking" | "available" | "missing">("checking")

  useEffect(() => {
    // Check if Supabase environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      setEnvStatus("available")
    } else {
      console.warn("Supabase environment variables are missing")
      setEnvStatus("missing")
    }
  }, [])

  if (envStatus === "checking" || typeof window === "undefined") {
    return null
  }

  if (envStatus === "missing") {
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-md bg-yellow-100 p-4 shadow-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ Supabase environment variables are missing. Some features may not work properly.
        </p>
      </div>
    )
  }

  return null
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Caught error:", event.error)
      setHasError(true)
    }

    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("error", handleError)
    }
  }, [])

  if (hasError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
        <p className="mb-4 text-red-500">An error occurred while loading the application.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    )
  }

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Check if we're in the browser
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if Supabase environment variables are available
  const hasSupabaseConfig =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string"

  // Render a minimal version on the server to avoid hydration issues
  if (!isMounted) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    )
  }

  // Full client-side render once mounted
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AccessibilityProvider>
          <SidebarProvider>
            {hasSupabaseConfig ? (
              <AuthProvider>
                <UserProvider>
                  <EnvironmentCheck />
                  {children}
                </UserProvider>
              </AuthProvider>
            ) : (
              <>
                <EnvironmentCheck />
                {children}
              </>
            )}
          </SidebarProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
