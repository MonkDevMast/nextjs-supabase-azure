"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function SubscriptionExpiredPage() {
  const router = useRouter()

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md apple-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Subscription Expired</CardTitle>
          <CardDescription>Your subscription has expired or been cancelled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You no longer have access to premium features. Renew your subscription to continue generating high-quality
            wallpapers.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={() => router.push("/dashboard/pricing")}
            className="w-full rounded-full bg-blue-600 hover:bg-blue-700"
          >
            Renew Subscription
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full rounded-full">
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
