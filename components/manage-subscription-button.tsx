"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ManageSubscriptionButtonProps {
  customerId: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  children?: React.ReactNode
}

export function ManageSubscriptionButton({
  customerId,
  className,
  variant = "outline",
  children = "Manage Subscription",
}: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleManageSubscription = async () => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "No subscription found to manage.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create customer portal session")
      }
    } catch (error) {
      console.error("Customer portal error:", error)
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleManageSubscription}
      disabled={loading || !customerId}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
