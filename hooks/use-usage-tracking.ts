"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseUsageTrackingProps {
  userId?: string
  onLimitReached?: () => void
  onApproachingLimit?: () => void
}

export function useUsageTracking({ userId, onLimitReached, onApproachingLimit }: UseUsageTrackingProps = {}) {
  const [isTracking, setIsTracking] = useState(false)
  const { toast } = useToast()

  const trackUsage = async (action: string) => {
    if (!userId) {
      console.warn("Cannot track usage: No user ID provided")
      return false
    }

    setIsTracking(true)

    try {
      const response = await fetch("/api/track-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to track usage")
      }

      // Check if user is approaching their limit
      if (data.isApproachingLimit) {
        onApproachingLimit?.()
        toast({
          title: "Approaching Usage Limit",
          description: `You're approaching your monthly limit. Consider upgrading your plan.`,
          variant: "warning",
        })
      }

      // Check if user has reached their limit
      if (data.currentUsage >= data.limit) {
        onLimitReached?.()
        toast({
          title: "Usage Limit Reached",
          description: "You've reached your monthly generation limit. Upgrade to continue.",
          variant: "destructive",
        })
        return false
      }

      return true
    } catch (error) {
      console.error("Error tracking usage:", error)
      return false
    } finally {
      setIsTracking(false)
    }
  }

  return {
    trackUsage,
    isTracking,
  }
}
