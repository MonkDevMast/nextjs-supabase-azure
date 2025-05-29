"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || data.details || "Failed to send message")
      }

      setIsSubmitted(true)
      setName("")
      setEmail("")
      setMessage("")

      toast({
        title: "Message sent",
        description: "We've received your message and will get back to you soon.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
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
          Thank you! Your message has been sent. We'll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-2 md:space-y-3" onSubmit={handleSubmit}>
      <div>
        <Input
          type="text"
          placeholder="Your name (optional)"
          className="rounded-xl h-8 md:h-9 bg-zinc-800 border-zinc-700 text-xs md:text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
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
      <div>
        <Textarea
          placeholder="Your message"
          className="rounded-xl resize-none bg-zinc-800 border-zinc-700 min-h-[60px] md:min-h-[80px] text-xs md:text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      <Button className="rounded-full w-full h-8 md:h-9 text-xs md:text-sm" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          "Sending..."
        ) : (
          <>
            <Send className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}
