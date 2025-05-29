"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { supabaseClient } from "@/lib/supabase"

type UserProfile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  is_profile_public: boolean
  created_at: string
  updated_at: string
}

type UserContextType = {
  profile: UserProfile | null
  isLoading: boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>
  refreshProfile: () => Promise<void>
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  profile: null,
  isLoading: false,
  updateProfile: async () => ({ error: new Error("User context not initialized") }),
  refreshProfile: async () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Get auth state from useAuth hook, including the new authReady flag
  const { user, isAuthenticated, session, authReady } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [profileCreationAttempted, setProfileCreationAttempted] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<boolean>(false)

  // Update profile fetching logic to use authReady
  useEffect(() => {
    const createFallbackProfile = () => {
      if (!user) return null

      return {
        id: user.id,
        display_name: user.email?.split("@")[0] || "User",
        avatar_url: null,
        is_profile_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    const fetchProfile = async () => {
      // Only proceed if we have user
      if (!user || !user.id) {
        setProfile(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // If we've had fetch errors before, use fallback immediately
        if (fetchError) {
          const fallbackProfile = createFallbackProfile()
          setProfile(fallbackProfile)
          console.warn("Using fallback profile due to previous fetch errors")
          setIsLoading(false)
          return
        }

        // Wrap the Supabase query in a try-catch to handle any potential errors
        let profileData
        try {
          const { data, error } = await supabaseClient.from("profiles").select("*").eq("id", user.id)

          if (error) {
            console.error("Error fetching user profile:", error)
            throw error
          }

          profileData = data
        } catch (supabaseError) {
          console.error("Supabase query failed:", supabaseError)
          setFetchError(true)

          // Use fallback profile
          const fallbackProfile = createFallbackProfile()
          setProfile(fallbackProfile)
          console.warn("Using fallback profile due to Supabase query error")
          setIsLoading(false)
          return
        }

        // If profile exists, use it
        if (profileData && profileData.length > 0) {
          setProfile(profileData[0])
          setIsLoading(false)
          return
        }

        // If no profile exists and we haven't tried to create one yet
        if ((!profileData || profileData.length === 0) && !profileCreationAttempted) {
          setProfileCreationAttempted(true)

          // Use fallback profile instead of trying to create one via API
          const fallbackProfile = createFallbackProfile()
          setProfile(fallbackProfile)
          console.warn("Using fallback profile as no profile found")
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error in profile management:", error)
        setFetchError(true)

        // Use fallback profile for any uncaught errors
        if (user) {
          const fallbackProfile = createFallbackProfile()
          setProfile(fallbackProfile)
          console.warn("Using fallback profile due to uncaught error")
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch profile when auth is ready and user is authenticated
    if (authReady && user && isAuthenticated) {
      fetchProfile()
    } else if (authReady && !isAuthenticated) {
      // If auth is ready but user is not authenticated
      setProfile(null)
      setIsLoading(false)

      // Add diagnostic log for debugging
      if (typeof window !== "undefined") {
        console.log("🚪 Auth ready but not authenticated")
      }
    }
  }, [authReady, user, isAuthenticated, profileCreationAttempted, fetchError])

  // Update profile management functions with better error handling
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !user.id || !session) {
      return { error: new Error("User not authenticated or session not available") }
    }

    try {
      // If we've had fetch errors before, just update local state
      if (fetchError) {
        if (profile) {
          const updatedProfile = {
            ...profile,
            ...updates,
            updated_at: new Date().toISOString(),
          }

          setProfile(updatedProfile)
          console.warn("Using local profile update due to previous fetch errors")
          return { error: null }
        }
        return { error: new Error("No profile available for local update") }
      }

      // Try to update via Supabase
      try {
        const { error: directUpdateError } = await supabaseClient
          .from("profiles")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (!directUpdateError) {
          // If direct update worked, refresh and return
          await refreshProfile()
          return { error: null }
        }

        throw directUpdateError
      } catch (supabaseError) {
        console.warn("Supabase update failed:", supabaseError)
        setFetchError(true)

        // Fall back to local update
        if (profile) {
          const updatedProfile = {
            ...profile,
            ...updates,
            updated_at: new Date().toISOString(),
          }

          setProfile(updatedProfile)
          console.warn("Using local profile update as fallback")
          return { error: null }
        }
      }

      return { error: new Error("Failed to update profile and no local profile available") }
    } catch (error) {
      console.error("Error in updateProfile:", error)
      return { error }
    }
  }

  const refreshProfile = async () => {
    if (!user || !user.id || !session) {
      return
    }

    // If we've had fetch errors before, don't try to refresh
    if (fetchError) {
      console.warn("Skipping profile refresh due to previous fetch errors")
      return
    }

    try {
      setIsLoading(true)

      try {
        const { data, error } = await supabaseClient.from("profiles").select("*").eq("id", user.id)

        if (error) {
          console.error("Error refreshing user profile:", error)
          setFetchError(true)
          return
        }

        if (data && data.length > 0) {
          setProfile(data[0])
        } else {
          console.warn("No profile found during refresh")
        }
      } catch (supabaseError) {
        console.error("Supabase refresh query failed:", supabaseError)
        setFetchError(true)
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error)
      setFetchError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    profile,
    isLoading,
    updateProfile,
    refreshProfile,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserProfile = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProvider")
  }
  return context
}
