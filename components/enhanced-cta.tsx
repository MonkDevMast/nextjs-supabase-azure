"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface EnhancedCTAProps {
  primary?: {
    text: string
    href: string
    icon?: React.ReactNode
  }
  secondary?: {
    text: string
    href: string
    icon?: React.ReactNode
  }
  className?: string
  size?: "sm" | "md" | "lg"
  highlight?: boolean
  pulse?: boolean
}

export function EnhancedCTA({
  primary,
  secondary,
  className,
  size = "md",
  highlight = false,
  pulse = false,
}: EnhancedCTAProps) {
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Reset interaction state after some time to re-enable animations
    if (hasInteracted) {
      const timer = setTimeout(() => {
        setHasInteracted(false)
      }, 10000) // 10 seconds
      return () => clearTimeout(timer)
    }
  }, [hasInteracted])

  const sizeClasses = {
    sm: "text-sm py-1.5 px-3",
    md: "text-base py-2 px-4",
    lg: "text-lg py-3 px-6",
  }

  return (
    <div className={cn("flex justify-center", className)}>
      {primary && (
        <motion.div
          whileHover={!hasInteracted ? { scale: 1.05 } : {}}
          whileTap={!hasInteracted ? { scale: 0.98 } : {}}
          onHoverStart={() => setHasInteracted(true)}
          onHoverEnd={() => setHasInteracted(false)}
          className={cn(highlight && !hasInteracted ? "relative" : "")}
        >
          {highlight && !hasInteracted && (
            <motion.div
              className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-75 blur-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          )}
          <Button
            asChild
            className={cn(
              "rounded-full relative",
              sizeClasses[size],
              highlight && "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400",
            )}
          >
            <a href={primary.href}>
              {primary.icon || null}
              {primary.text}
              {!primary.icon && <ArrowRight className="ml-2 h-4 w-4" />}
            </a>
          </Button>
          {pulse && !hasInteracted && (
            <motion.div
              className="absolute top-0 left-0 right-0 bottom-0 rounded-full bg-primary"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
          )}
        </motion.div>
      )}
    </div>
  )
}
