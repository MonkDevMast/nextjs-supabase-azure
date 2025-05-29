"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  endDate: Date
  onExpire?: () => void
}

export function CountdownTimer({ endDate, onExpire }: CountdownTimerProps) {
  // Start with null state to avoid hydration mismatch
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(
    null,
  )
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsExpired(true)
        onExpire?.()
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    // Set initial state
    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate, onExpire])

  // Don't render anything during SSR or if expired
  if (!timeLeft || isExpired) {
    return null
  }

  return (
    <div className="text-sm text-zinc-400 mt-2 flex items-center justify-center">
      <span className="inline-flex items-center">
        Deal ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  )
}
