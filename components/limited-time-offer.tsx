"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Clock, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface LimitedTimeOfferProps {
  title: string
  description: string
  discount: string
  code?: string
  expiryDate: Date
  ctaText: string
  ctaLink: string
  className?: string
  onClose?: () => void
  position?: "top" | "bottom"
}

export function LimitedTimeOffer({
  title,
  description,
  discount,
  code,
  expiryDate,
  ctaText,
  ctaLink,
  className,
  position = "bottom",
}: LimitedTimeOfferProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = expiryDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsVisible(false)
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [expiryDate])

  const handleClose = () => {
    setIsVisible(false)
  }

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === "top" ? -100 : 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === "top" ? -100 : 100 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed left-0 right-0 z-50 mx-auto max-w-lg px-4",
          position === "top" ? "top-4" : "bottom-4",
          className,
        )}
      >
        <Card className="border-primary/20 bg-gradient-to-r from-blue-900/50 to-purple-900/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="absolute top-2 right-2">
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleClose}>
                <X className="h-3 w-3" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{description}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      Expires in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </span>
                  </div>

                  {code && (
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-md font-mono text-sm cursor-pointer"
                        onClick={copyCode}
                      >
                        {code}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={copyCode}>
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-primary mb-2">{discount}</div>
                  <Button asChild className="rounded-full">
                    <a href={ctaLink}>
                      {ctaText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient"></div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
