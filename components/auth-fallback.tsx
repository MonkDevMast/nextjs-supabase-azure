"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthFallback() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if Supabase environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setIsVisible(true)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication Unavailable</CardTitle>
        <CardDescription>
          The authentication system is currently unavailable due to missing configuration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Please make sure the Supabase environment variables are properly configured:
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </CardFooter>
    </Card>
  )
}
