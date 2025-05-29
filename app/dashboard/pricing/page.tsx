"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { CheckoutButton } from "@/components/checkout-button"
import { PLAN_DETAILS } from "@/utils/stripe"
import { ExpandedFAQ } from "@/components/expanded-faq"
import { supabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

// Helper function to determine if a plan is an upgrade or downgrade
function getPlanRank(planType: string): number {
  switch (planType.toLowerCase()) {
    case "unlimited":
      return 3
    case "starter":
      return 2
    case "free":
      return 1
    default:
      return 0
  }
}

export default function PricingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isDowngrading, setIsDowngrading] = useState(false)

  // Fetch user session and subscription data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get the current user session
        const { data: sessionData } = await supabaseClient.auth.getSession()

        if (!sessionData.session) {
          // Redirect to login if no session
          router.push("/login")
          return
        }

        const currentUserId = sessionData.session.user.id
        setUserId(currentUserId)

        // Fetch subscription data using the client-side Supabase instance
        const { data: subscriptionData, error } = await supabaseClient
          .from("subscriptions")
          .select("*")
          .eq("user_id", currentUserId)
          .maybeSingle()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching subscription:", error)
          toast({
            title: "Error",
            description: "Failed to load subscription data. Please try again.",
            variant: "destructive",
          })
        } else if (error && error.code === "PGRST116") {
          // This is the "no rows returned" error code, which is expected when user has no subscription
          console.log("No subscription found for user, defaulting to free plan")
        }

        console.log("Subscription data loaded:", subscriptionData)
        setSubscription(subscriptionData || null)
      } catch (error) {
        console.error("Error in data fetching:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, toast])

  const currentPlan = subscription?.plan_type || "free"
  const currentPlanRank = getPlanRank(currentPlan)

  // Define plans with dynamic current plan detection
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic access to wallpaper generation",
      features: ["5 wallpapers per month", "1080p resolution"],
      buttonText: currentPlan === "free" ? "Current Plan" : "Downgrade",
      buttonVariant: "outline" as const,
      disabled: currentPlan === "free",
      popular: false,
      priceId: "",
      rank: 1,
    },
    {
      name: "Starter",
      price: "$8.95",
      originalPrice: "$14.95",
      description: "More wallpapers with better quality",
      features: ["100 wallpapers per month", "2K resolution", "Image history for 30 days"],
      buttonText: currentPlan === "starter" ? "Current Plan" : currentPlan === "unlimited" ? "Downgrade" : "Upgrade",
      buttonVariant: "default" as const,
      disabled: currentPlan === "starter",
      popular: true,
      priceId: PLAN_DETAILS.starter.priceId || "",
      rank: 2,
    },
    {
      name: "Unlimited",
      price: "$19.95",
      description: "Unlimited access to all features",
      features: [
        "Unlimited wallpapers",
        "4K resolution",
        "Reference image upload",
        "Batch download",
        "Priority processing",
        "Image history for 90 days",
        "Custom aspect ratios",
      ],
      buttonText: currentPlan === "unlimited" ? "Current Plan" : "Upgrade",
      buttonVariant: "default" as const,
      disabled: currentPlan === "unlimited",
      popular: false,
      priceId: PLAN_DETAILS.unlimited.priceId || "",
      rank: 3,
    },
  ]

  const handleDowngradeToFree = async () => {
    if (!userId || !subscription?.stripe_subscription_id) return

    setIsDowngrading(true)

    try {
      // Call the API to downgrade to free plan
      const response = await fetch("/api/downgrade-to-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subscriptionId: subscription.stripe_subscription_id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to downgrade to free plan")
      }

      toast({
        title: "Plan Downgraded",
        description: "You have been successfully downgraded to the free plan.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error downgrading to free plan:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to downgrade to free plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDowngrading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 centered-container">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-light tracking-tight">Pricing Plans</h2>
        <p className="text-zinc-400 text-lg mt-2">Choose the perfect plan for your wallpaper needs</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.popular ? "border-primary shadow-md relative apple-card" : "relative apple-card"}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                Popular
              </div>
            )}
            {plan.originalPrice && (
              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                40% OFF
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl font-medium">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-light">{plan.price}</span>
                <span className="text-sm text-zinc-400">/month</span>
                {plan.originalPrice && (
                  <span className="ml-2 line-through text-zinc-500 text-xs">{plan.originalPrice}</span>
                )}
              </div>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.name === "Free" ? (
                <Button
                  variant={plan.buttonVariant}
                  className="w-full rounded-full"
                  disabled={plan.disabled || isDowngrading}
                  onClick={handleDowngradeToFree}
                >
                  {isDowngrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downgrading...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              ) : (
                <CheckoutButton
                  priceId={plan.priceId}
                  planName={plan.name.toLowerCase()}
                  variant={plan.buttonVariant}
                  className="w-full rounded-full"
                  disabled={plan.disabled}
                >
                  {plan.buttonText}
                </CheckoutButton>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Extended FAQ Section */}
      <div className="mt-8 max-w-3xl mx-auto">
        <ExpandedFAQ />
      </div>
    </div>
  )
}
