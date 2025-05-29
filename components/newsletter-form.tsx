"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || data.details || "Failed to subscribe")
      }

      setIsSubmitted(true)
      setEmail("")

      toast({
        title: "Subscribed!",
        description: "You've been successfully subscribed to our newsletter.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 md:space-y-3 py-3 md:py-4">
        <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-green-500" />
        <p className="text-center text-zinc-200 text-xs md:text-sm">
          Thanks for subscribing! You'll receive our next newsletter.
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-2 md:space-y-3" onSubmit={handleSubmit}>
      <div>
        <Input
          type="email"
          placeholder="Your email"
          className="rounded-xl h-8 md:h-9 bg-zinc-800 border-zinc-700 text-xs md:text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button className="rounded-full w-full h-8 md:h-9 text-xs md:text-sm" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  )
}
