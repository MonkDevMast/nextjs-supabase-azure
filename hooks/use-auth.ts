"use client"

import { useContext } from "react"
import { AuthContext } from "@/contexts/auth-context"

export function useAuth() {
  const context = useContext(AuthContext)

  // Provide default values if context is undefined
  if (!context) {
    return {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: async () => ({ error: new Error("Auth context not available") }),
      signUp: async () => ({ error: new Error("Auth context not available") }),
      signOut: async () => {},
      resetPassword: async () => ({ error: new Error("Auth context not available") }),
      updatePassword: async () => ({ error: new Error("Auth context not available") }),
      verifyEmailChange: async () => ({ error: new Error("Auth context not available") }),
    }
  }

  return context
}
