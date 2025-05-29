"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResendEmail = async () => {
    if (countdown > 0 || !email) return

    setIsResending(true)

    try {
      const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email,
      })

      if (error) throw error

      toast({
        title: "Verification email sent",
        description: "We've sent another verification email to your inbox.",
      })

      // Set a 60-second countdown before allowing another resend
      setCountdown(60)
    } catch (error: any) {
      console.error("Error resending verification email:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[400px]">
        <Card className="apple-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-light">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-zinc-400">
              We've sent a verification link to <span className="font-medium text-white">{email}</span>
            </p>
            <p className="text-sm text-zinc-500">
              Click the link in the email to verify your account and complete the sign-up process.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={handleResendEmail}
              disabled={isResending || countdown > 0}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : countdown > 0 ? (
                `Resend email (${countdown}s)`
              ) : (
                "Resend verification email"
              )}
            </Button>
            <Link href="/login" className="w-full">
              <Button className="w-full rounded-full">
                Go to login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
