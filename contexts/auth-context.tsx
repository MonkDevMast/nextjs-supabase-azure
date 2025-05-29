"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { customSupabaseClient } from "@/lib/custom-supabase"
import { supabaseClient } from "@/lib/supabase"

// Define the shape of our auth context
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  authReady: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any | null }>
  updatePassword: (password: string) => Promise<{ error: any | null }>
  verifyEmailChange: (token: string) => Promise<{ error: any | null }>
}

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  authReady: false,
  signIn: async () => ({ error: new Error("Auth not initialized") }),
  signUp: async () => ({ error: new Error("Auth not initialized") }),
  signOut: async () => {},
  resetPassword: async () => ({ error: new Error("Auth not initialized") }),
  updatePassword: async () => ({ error: new Error("Auth not initialized") }),
  verifyEmailChange: async () => ({ error: new Error("Auth not initialized") }),
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [authReady, setAuthReady] = useState<boolean>(false)
  const initialLoadDone = useRef(false)

  // Use both clients to ensure session persistence
  const customClient = customSupabaseClient
  const standardClient = supabaseClient

  // Initialize auth - only once, with no redirects
  useEffect(() => {
    if (initialLoadDone.current) return

    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        console.log("Initializing auth state...")

        // Try to get session from both clients to maximize chances of success
        const { data: customData, error: customError } = await customClient.auth.getSession()
        const { data: standardData, error: standardError } = await standardClient.auth.getSession()

        // Use whichever session is available
        const data = customData.session ? customData : standardData
        const error = customData.session ? customError : standardError

        if (error) {
          console.error("Error getting session:", error.message)
        } else if (data.session) {
          console.log("Session found during initialization")
          setSession(data.session)
          setUser(data.session?.user || null)
        } else {
          console.log("No session found during initialization")
        }

        // Set up auth state change listener - but don't redirect
        const {
          data: { subscription },
        } = standardClient.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event, newSession ? "session exists" : "no session")

          if (newSession) {
            console.log("Setting new session and user from auth state change")
            setSession(newSession)
            setUser(newSession.user)
          } else if (event === "SIGNED_OUT") {
            console.log("User signed out, clearing session and user")
            setSession(null)
            setUser(null)
          }
        })

        // Disable all window focus/blur events
        const disableWindowEvents = (e: Event) => {
          e.stopPropagation()
          console.log("Preventing window event:", e.type)
        }

        window.addEventListener("focus", disableWindowEvents, true)
        window.addEventListener("blur", disableWindowEvents, true)
        window.addEventListener("visibilitychange", disableWindowEvents, true)

        setAuthReady(true)
        initialLoadDone.current = true

        return () => {
          subscription.unsubscribe()
          window.removeEventListener("focus", disableWindowEvents, true)
          window.removeEventListener("blur", disableWindowEvents, true)
          window.removeEventListener("visibilitychange", disableWindowEvents, true)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setAuthReady(true)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [customClient.auth, standardClient.auth])

  // Auth functions - with no automatic redirects
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await standardClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      const { data, error } = await standardClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      })

      if (error) {
        return { error }
      }

      // Store email and full_name for later use in profile creation
      if (typeof window !== "undefined") {
        localStorage.setItem("userEmail", email)
        if (metadata?.full_name) {
          localStorage.setItem("userFullName", metadata.full_name)
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await standardClient.auth.signOut()
    // No automatic redirects
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await standardClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await standardClient.auth.updateUser({
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const verifyEmailChange = async (token: string) => {
    try {
      const { error } = await standardClient.auth.verifyOtp({
        token_hash: token,
        type: "email_change",
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    authReady,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    verifyEmailChange,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
