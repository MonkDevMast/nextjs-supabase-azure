"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Database } from "@/types/supabase"

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]

interface SubscriptionStatusProps {
  subscription: Subscription | null
}

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // If no subscription record exists, show the free plan card
  if (!subscription) {
    return (
      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Subscription</CardTitle>
          <CardDescription>Free Plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Current Plan</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Status</span>
              <Badge variant="outline">Free Plan</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/pricing" className="w-full">
            <Button className="w-full rounded-full">Upgrade Plan</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  // Format the plan type for display
  const planType = subscription.plan_type
    ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)
    : "Free"

  // Format the expiration date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr))
  }

  const expirationDate = formatDate(subscription.current_period_end)

  // Determine if subscription is cancelled based on cancel_at_period_end
  const isCancelled = subscription.cancel_at_period_end === true

  const handleCancelSubscription = async () => {
    if (!subscription.stripe_subscription_id) return

    setLoading(true)
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.stripe_subscription_id }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription will end at the current billing period.",
        })
        // Reload the page to reflect the updated status
        window.location.reload()
      } else {
        throw new Error(data.error || "Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!subscription.stripe_subscription_id) return

    setLoading(true)
    try {
      const response = await fetch("/api/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.stripe_subscription_id }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Subscription Reactivated",
          description: "Your subscription has been successfully reactivated.",
        })
        // Reload the page to reflect the updated status
        window.location.reload()
      } else {
        throw new Error(data.error || "Failed to reactivate subscription")
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error)
      toast({
        title: "Error",
        description: "Failed to reactivate subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="apple-card">
      <CardHeader>
        <CardTitle className="text-xl font-light">Subscription Status</CardTitle>
        <CardDescription>Manage your subscription and billing information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Current Plan</span>
          <span className="font-medium">{planType}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Status</span>
          <div>
            {isCancelled ? (
              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                <AlertTriangle className="h-3 w-3 mr-1" /> Cancelled
              </Badge>
            ) : subscription.status === "active" ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" /> Active
              </Badge>
            ) : subscription.status === "past_due" ? (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" /> Past Due
              </Badge>
            ) : (
              <Badge variant="outline">{subscription.status || "Free Plan"}</Badge>
            )}
          </div>
        </div>

        {subscription.current_period_end && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">{isCancelled ? "Expires On" : "Next Billing Date"}</span>
            <span>{expirationDate}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {subscription.stripe_subscription_id && (
          <>
            {/* Manage Subscription button removed as requested */}

            {!isCancelled && subscription.status === "active" && (
              <Button
                variant="outline"
                className="w-full rounded-full text-red-500 hover:text-red-400 hover:bg-red-900/20"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Cancel Subscription
              </Button>
            )}

            {isCancelled && (
              <Button
                variant="outline"
                className="w-full rounded-full text-green-500 hover:text-green-400 hover:bg-green-900/20"
                onClick={handleReactivateSubscription}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Reactivate Subscription
              </Button>
            )}
          </>
        )}

        {(!subscription.stripe_subscription_id || subscription.plan_type === "free") && (
          <Button className="w-full rounded-full" onClick={() => (window.location.href = "/dashboard/pricing")}>
            Upgrade Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
