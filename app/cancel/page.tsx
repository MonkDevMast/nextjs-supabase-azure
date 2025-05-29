"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md apple-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>Your subscription wasn't processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You've cancelled the checkout process. No worries! You can try again whenever you're ready.
          </p>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => router.push("/pricing")} className="rounded-full">
              View Plans Again
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="rounded-full">
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
