"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedBackgroundProps {
  className?: string
  intensity?: "subtle" | "medium" | "strong"
  speed?: "slow" | "medium" | "fast"
  color1?: string
  color2?: string
}

export function AnimatedBackground({
  className,
  intensity = "subtle",
  speed = "slow",
  color1 = "#0f172a",
  color2 = "#1e293b",
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Convert intensity to numeric value
    const intensityValue = intensity === "subtle" ? 0.03 : intensity === "medium" ? 0.06 : 0.1

    // Convert speed to numeric value
    const speedValue = speed === "slow" ? 0.0005 : speed === "medium" ? 0.001 : 0.002

    // Animation variables
    let time = 0

    // Animation function
    const animate = () => {
      time += speedValue

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create gradient
      const gradient = ctx.createLinearGradient(
        canvas.width * (0.5 + Math.sin(time) * 0.5),
        0,
        canvas.width * (0.5 + Math.cos(time) * 0.5),
        canvas.height,
      )

      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw subtle noise pattern
      for (let i = 0; i < canvas.width * canvas.height * intensityValue; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 1.5

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.02})`
        ctx.fillRect(x, y, size, size)
      }

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [intensity, speed, color1, color2])

  return <canvas ref={canvasRef} className={cn("fixed inset-0 -z-10", className)} aria-hidden="true" />
}
