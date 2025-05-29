"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { forwardRef } from "react"

// Button with hover and tap animations
export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "subtle" | "medium" | "strong"
  }
>(({ className, variant = "medium", children, ...props }, ref) => {
  const animations = {
    subtle: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    medium: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    strong: {
      scale: 1.1,
      transition: { duration: 0.2 },
    },
  }

  return (
    <motion.button
      ref={ref}
      className={className}
      whileHover={animations[variant]}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
})
AnimatedButton.displayName = "AnimatedButton"

// Card with hover effect
export const AnimatedCard = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "subtle" | "medium" | "strong"
  }
>(({ className, variant = "medium", children, ...props }, ref) => {
  const animations = {
    subtle: {
      y: -5,
      transition: { duration: 0.3 },
    },
    medium: {
      y: -10,
      transition: { duration: 0.3 },
    },
    strong: {
      y: -15,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      whileHover={animations[variant]}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  )
})
AnimatedCard.displayName = "AnimatedCard"

// Fade-in element
export const FadeIn = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    delay?: number
    direction?: "up" | "down" | "left" | "right" | "none"
  }
>(({ className, delay = 0, direction = "up", children, ...props }, ref) => {
  const directionVariants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...directionVariants[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
})
FadeIn.displayName = "FadeIn"

// Staggered children animation
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    staggerDelay?: number
  }
>(({ className, staggerDelay = 0.1, children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
})
StaggerContainer.displayName = "StaggerContainer"

// Staggered child item
export const StaggerItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)
StaggerItem.displayName = "StaggerItem"

// Pulse animation (for notifications, etc.)
export const PulseAnimation = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    intensity?: "subtle" | "medium" | "strong"
  }
>(({ className, intensity = "medium", children, ...props }, ref) => {
  const intensityValues = {
    subtle: { scale: 1.05, duration: 2 },
    medium: { scale: 1.1, duration: 1.5 },
    strong: { scale: 1.15, duration: 1 },
  }

  const { scale, duration } = intensityValues[intensity]

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      animate={{ scale: [1, scale, 1] }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
})
PulseAnimation.displayName = "PulseAnimation"

// Loading spinner with animation
export const AnimatedSpinner = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "md" | "lg"
    color?: string
  }
>(({ className, size = "md", color = "currentColor", ...props }, ref) => {
  const sizeValues = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div ref={ref} className={cn("relative", sizeValues[size], className)} {...props}>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-solid"
        style={{ borderColor: `${color} transparent transparent transparent` }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  )
})
AnimatedSpinner.displayName = "AnimatedSpinner"
