"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, Loader2 } from "lucide-react"
import { createClientBrowserClient } from "@/lib/supabase"
import { AuthFallback } from "@/components/auth-fallback"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})

  // Create a Supabase client for the browser
  const supabase = createClientBrowserClient()

  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check for existing session on page load and redirect if found
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        console.log("Existing session found, redirecting to dashboard")
        router.push("/dashboard")
      }
    }

    checkSession()
  }, [router, supabase.auth])

  // Check for error parameter in URL
  const errorParam = searchParams.get("error")

  // Show error toast if there's an error parameter
  useEffect(() => {
    if (errorParam === "auth_callback_error") {
      toast({
        title: "Authentication error",
        description: "There was a problem with the authentication process. Please try again.",
        variant: "destructive",
      })
    }
  }, [errorParam, toast])

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <AuthFallback />
      </div>
    )
  }

  const validateForm = () => {
    const newErrors: {
      email?: string
      password?: string
    } = {}

    if (!email) {
      newErrors.email = "Email is required"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
        })

        // Get the redirect URL from the search params or default to dashboard
        const redirectTo = searchParams.get("redirect") || "/dashboard"

        // Force a refresh of the auth state before redirecting
        await supabase.auth.getSession()

        // Use replace instead of push to avoid adding to history
        router.replace(redirectTo)
      }
    } catch (error: any) {
      console.error("Login error:", error)

      if (error.message?.includes("Invalid login credentials")) {
        setErrors({ general: "Invalid email or password" })
      } else {
        setErrors({ general: error.message || "Failed to login" })
      }

      toast({
        title: "Error",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost" className="rounded-full">
          Back
        </Button>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/20 mb-2">
            <ImageIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">Welcome to WallScape.io</h1>
          <p className="text-zinc-400 text-sm md:text-base">Enter your email and password to sign in to your account</p>
        </div>
        <Card className="apple-card">
          <form onSubmit={handleLogin}>
            <CardContent className="pt-5 md:pt-6">
              <div className="space-y-3 md:space-y-4">
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="email" className="text-sm md:text-base">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`rounded-xl h-10 md:h-12 bg-zinc-900 border-zinc-800 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm md:text-base">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-xs md:text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`rounded-xl h-10 md:h-12 bg-zinc-900 border-zinc-800 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                {errors.general && (
                  <div className="rounded-md bg-red-500/10 p-3">
                    <p className="text-red-500 text-xs">{errors.general}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full rounded-full h-10 md:h-12 text-sm md:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
          <div className="relative px-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-zinc-400">Or continue with</span>
            </div>
          </div>
          <CardFooter className="flex flex-col gap-3 md:gap-4 pt-4">
            <Button
              variant="outline"
              className="w-full rounded-full h-10 md:h-12 text-sm md:text-base"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true)
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                  if (error) throw error
                } catch (error) {
                  console.error("Google sign in error:", error)
                  toast({
                    title: "Error",
                    description: "Failed to sign in with Google. Please try again.",
                    variant: "destructive",
                  })
                  setIsLoading(false)
                }
              }}
            >
              Google
            </Button>
            <p className="text-center text-xs md:text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
