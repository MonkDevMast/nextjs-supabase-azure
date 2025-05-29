"use client"

import { useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase"

interface ProfileInitializerProps {
  userId: string
}

export function ProfileInitializer({ userId }: ProfileInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeProfile = async () => {
      if (isInitialized) return

      try {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is the error code for "no rows found"
          console.error("Error checking profile:", profileError)
          return
        }

        // If profile exists, we're done
        if (profile) {
          setIsInitialized(true)
          return
        }

        // If profile doesn't exist, create it via the API
        const response = await fetch("/api/auth/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to initialize profile")
        }

        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing profile:", error)
      }
    }

    if (userId) {
      initializeProfile()
    }
  }, [userId, isInitialized])

  // This component doesn't render anything
  return null
}
