"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

interface CheckoutButtonProps {
  priceId: string
  planName: string
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined
  className?: string
  disabled?: boolean
}

export function CheckoutButton({
  priceId,
  planName,
  children,
  variant = "default",
  className,
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log("Starting checkout process for plan:", planName, "with price ID:", priceId)

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          planName,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Checkout API error response:", data)
        throw new Error(data.error || data.details || "Checkout failed")
      }

      if (data.url) {
        console.log("Redirecting to Stripe checkout:", data.url)
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} className={className} onClick={handleCheckout} disabled={disabled || loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
