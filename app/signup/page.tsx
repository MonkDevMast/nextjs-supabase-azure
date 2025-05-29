"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, Loader2 } from "lucide-react"
import { createClientBrowserClient } from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    name?: string
    general?: string
  }>({})

  // Create a Supabase client for the browser
  const supabase = createClientBrowserClient()

  const validateForm = () => {
    const newErrors: {
      email?: string
      password?: string
      name?: string
    } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!name) {
      newErrors.name = "Name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      console.log("Starting signup process with email:", email)

      // Use the most basic form of signUp - no metadata, no options
      console.log("Calling supabase.auth.signUp with email:", email)
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      }).then((data) => {
        console.log(data)
      }).catch((error) => {
        console.error('Signup error:', error.message);
      });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        console.error("Auth signup error:", error)
        throw error
      }

      if (!data.user) {
        throw new Error("User creation failed")
      }

      console.log("User created successfully with ID:", data.user.id)

      // Store user info in localStorage for later profile creation
      localStorage.setItem("pendingProfileCreation", "true")
      localStorage.setItem("userFullName", name)
      localStorage.setItem("userEmail", email)

      toast({
        title: "Verification email sent",
        description: "Please check your email to verify your account.",
      })

      // Redirect to verification pending page
      router.push("/verify-email?email=" + encodeURIComponent(email))
    } catch (error: any) {
      console.error("Signup error:", error)

      // Handle specific error cases
      if (error.message?.includes("already registered")) {
        setErrors({ email: "This email is already registered" })
        toast({
          title: "Account already exists",
          description: "Please try logging in instead.",
          variant: "destructive",
        })
      } else {
        setErrors({ general: error.message || "Failed to create account" })
        toast({
          title: "Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
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
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">Join WallScape.io</h1>
          <p className="text-zinc-400 text-sm md:text-base">Enter your information to create an account</p>
        </div>
        <Card className="apple-card">
          <form onSubmit={handleSignup}>
            <CardContent className="pt-5 md:pt-6">
              <div className="space-y-3 md:space-y-4">
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="name" className="text-sm md:text-base">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`rounded-xl h-10 md:h-12 bg-zinc-900 border-zinc-800 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
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
                  <Label htmlFor="password" className="text-sm md:text-base">
                    Password
                  </Label>
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
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
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
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
        <p className="text-center text-xs text-zinc-500">
          By clicking create account, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
