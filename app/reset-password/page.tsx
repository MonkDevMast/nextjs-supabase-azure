"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Lock, Loader2, CheckCircle } from "lucide-react"
import { supabaseClient } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [hasSession, setHasSession] = useState(false)

  // Check if user has a valid reset password session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession()
      setHasSession(!!data.session)
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      setError("Please enter a new password")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabaseClient.auth.updateUser({
        password,
      })

      if (error) throw error

      setIsSubmitted(true)
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      })

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      console.error("Password reset error:", error)
      setError(error.message || "Failed to reset password. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
        <Card className="apple-card w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-light">Invalid or Expired Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-zinc-400">
              This password reset link is invalid or has expired. Please request a new password reset link.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/forgot-password">
              <Button className="rounded-full">Request New Link</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[350px]">
        <Card className="apple-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-light">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-center text-zinc-400">Your password has been successfully reset.</p>
                <p className="text-center text-sm text-zinc-500">You will be redirected to the login page shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`rounded-xl h-10 md:h-12 bg-zinc-900 border-zinc-800 ${error ? "border-red-500" : ""}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`rounded-xl h-10 md:h-12 bg-zinc-900 border-zinc-800 ${error ? "border-red-500" : ""}`}
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
