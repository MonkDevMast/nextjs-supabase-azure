"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [plan, setPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get plan from URL parameters
    const planParam = searchParams.get("plan")
    const sessionId = searchParams.get("session_id")
    const userId = searchParams.get("user_id")

    if (planParam) {
      setPlan(planParam)
    }

    // Verify the subscription was created in Supabase
    const verifySubscription = async () => {
      try {
        setIsLoading(true)

        // Get the current user
        const {
          data: { session },
        } = await supabaseClient.auth.getSession()

        if (!session) {
          toast({
            title: "Authentication error",
            description: "Please log in to view your subscription",
            variant: "destructive",
          })
          window.location.href = "/login"
          return
        }

        const currentUserId = userId || session.user.id

        // Check if the subscription exists in Supabase
        const { data: subscription, error } = await supabaseClient
          .from("subscriptions")
          .select("*")
          .eq("user_id", currentUserId)
          .maybeSingle()

        if (error) {
          console.error("Error fetching subscription:", error)

          // If no subscription found, create one
          if (error.code === "PGRST116") {
            console.log("No subscription found, creating one...")

            // Call our API to create a subscription
            const response = await fetch("/api/create-subscription", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: currentUserId,
                planType: planParam || "starter",
              }),
            })

            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.error || "Failed to create subscription")
            }

            toast({
              title: "Subscription created",
              description: "Your subscription has been created successfully.",
            })
          } else {
            toast({
              title: "Subscription error",
              description: "There was an issue verifying your subscription. Please contact support.",
              variant: "destructive",
            })
          }
        } else if (subscription) {
          // Show success notification
          toast({
            title: "Payment Successful",
            description: "Your subscription has been activated. Welcome aboard!",
          })
        }
      } catch (error) {
        console.error("Error verifying subscription:", error)
        toast({
          title: "Error",
          description: "There was an error processing your subscription. Please contact support.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId) {
      verifySubscription()
    } else {
      setIsLoading(false)
    }
  }, [searchParams, toast])

  // Use window.location.href for hard navigation to ensure fresh data
  const navigateToDashboard = () => {
    window.location.href = "/dashboard"
  }

  const navigateToGenerate = () => {
    window.location.href = "/dashboard/generate"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md apple-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            {plan
              ? `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan has been activated.`
              : "Your subscription has been activated."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Thank you for subscribing to WallScape.io. You now have access to premium features to create amazing
            wallpapers.
          </p>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={navigateToGenerate}
              className="rounded-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying subscription...
                </>
              ) : (
                "Start Creating Wallpapers"
              )}
            </Button>
            <Button variant="outline" onClick={navigateToDashboard} className="rounded-full">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
