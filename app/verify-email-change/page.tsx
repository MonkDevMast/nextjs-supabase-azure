"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailChangePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyEmailChange } = useAuth()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setError("Verification token is missing")
        setIsVerifying(false)
        return
      }

      try {
        const { error } = await verifyEmailChange(token)

        if (error) {
          setError(error)
          setIsSuccess(false)
        } else {
          setIsSuccess(true)
          setError(null)

          toast({
            title: "Email verified",
            description: "Your email address has been successfully updated.",
          })
        }
      } catch (err) {
        setError("An unexpected error occurred")
        setIsSuccess(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams, verifyEmailChange, toast])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Email Verification</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {isVerifying
              ? "Verifying your email address..."
              : isSuccess
                ? "Email verified successfully!"
                : "Verification failed"}
          </p>
        </div>

        <div className="space-y-4">
          {isVerifying ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : isSuccess ? (
            <div className="rounded-lg bg-green-900/20 p-4 text-center text-green-400">
              <p>Your email address has been successfully updated.</p>
            </div>
          ) : (
            <div className="rounded-lg bg-red-900/20 p-4 text-center text-red-400">
              <p>{error || "Failed to verify your email address. Please try again."}</p>
            </div>
          )}

          <div className="pt-4 text-center">
            <Button onClick={() => router.push("/dashboard/account")} className="rounded-full" disabled={isVerifying}>
              Return to Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
