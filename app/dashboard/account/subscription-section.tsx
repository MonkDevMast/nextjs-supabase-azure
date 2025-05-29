"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { ManageSubscriptionButton } from "@/components/manage-subscription-button"
import { useToast } from "@/hooks/use-toast"

interface SubscriptionSectionProps {
  user: {
    id: string
    email: string
    name: string
    plan: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    subscriptionStatus?: string
    subscriptionPeriodEnd?: Date
  }
}

export function SubscriptionSection({ user }: SubscriptionSectionProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatDate = (date?: Date) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const handleCancelSubscription = async () => {
    if (!user.stripeSubscriptionId) return

    setLoading(true)
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: user.stripeSubscriptionId }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription will end at the current billing period.",
        })
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
    if (!user.stripeSubscriptionId) return

    setLoading(true)
    try {
      const response = await fetch("/api/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: user.stripeSubscriptionId }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Subscription Reactivated",
          description: "Your subscription has been successfully reactivated.",
        })
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
        <CardTitle className="text-xl font-light">Subscription</CardTitle>
        <CardDescription>Manage your subscription and billing information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Current Plan</span>
          <span className="font-medium">{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Status</span>
          <div>
            {user.subscriptionStatus === "active" && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" /> Active
              </Badge>
            )}
            {user.subscriptionStatus === "canceled" && (
              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                <AlertTriangle className="h-3 w-3 mr-1" /> Cancelled
              </Badge>
            )}
            {user.subscriptionStatus === "past_due" && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" /> Past Due
              </Badge>
            )}
            {(!user.subscriptionStatus || user.subscriptionStatus === "none") && (
              <Badge variant="outline">Free Plan</Badge>
            )}
          </div>
        </div>

        {user.subscriptionPeriodEnd && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              {user.subscriptionStatus === "canceled" ? "Expires On" : "Next Billing Date"}
            </span>
            <span>{formatDate(user.subscriptionPeriodEnd)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {user.stripeCustomerId && user.stripeSubscriptionId && (
          <>
            <ManageSubscriptionButton customerId={user.stripeCustomerId} className="w-full rounded-full" />

            {user.subscriptionStatus === "active" && (
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

            {user.subscriptionStatus === "canceled" && (
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

        {(!user.stripeSubscriptionId || user.plan === "free") && (
          <Button className="w-full rounded-full" onClick={() => (window.location.href = "/dashboard/pricing")}>
            Upgrade Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
