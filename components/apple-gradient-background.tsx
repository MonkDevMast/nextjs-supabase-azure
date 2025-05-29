"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AppleGradientBackgroundProps {
  className?: string
  intensity?: "subtle" | "medium" | "strong"
}

export function AppleGradientBackground({ className, intensity = "subtle" }: AppleGradientBackgroundProps) {
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
    const intensityValue = intensity === "subtle" ? 0.5 : intensity === "medium" ? 0.7 : 0.9

    // Draw the initial gradient immediately to ensure something is visible
    const drawBackground = () => {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgba(10, 10, 20, 1)")
      gradient.addColorStop(1, "rgba(15, 15, 35, 1)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add some static orbs for immediate visual effect
      const orbs = [
        { x: canvas.width * 0.3, y: canvas.height * 0.3, radius: 300, color: [100, 100, 100, 0.05] }, // Gray
        { x: canvas.width * 0.7, y: canvas.height * 0.6, radius: 250, color: [120, 120, 120, 0.05] }, // Light Gray
        { x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 200, color: [80, 80, 80, 0.05] }, // Dark Gray
      ]

      orbs.forEach((orb) => {
        // Create radial gradient for each orb
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * intensityValue)
        const [r, g, b, a] = orb.color
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * intensityValue})`)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw the initial background
    drawBackground()

    // Animation variables
    let time = 0
    const orbs = [
      { x: canvas.width * 0.3, y: canvas.height * 0.3, radius: 300, color: [100, 100, 100, 0.05] }, // Gray
      { x: canvas.width * 0.7, y: canvas.height * 0.6, radius: 250, color: [120, 120, 120, 0.05] }, // Light Gray
      { x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 200, color: [80, 80, 80, 0.05] }, // Dark Gray
    ]

    // Animation function with reduced animation speed
    const animate = () => {
      time += 0.002 // Reduced speed for more subtle movement

      // Clear canvas with a very subtle gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgba(15, 15, 15, 1)")
      gradient.addColorStop(1, "rgba(20, 20, 20, 1)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw animated orbs
      orbs.forEach((orb, i) => {
        // Update orb position with gentle floating motion
        orb.x += Math.sin(time + i) * 0.2 // Reduced movement
        orb.y += Math.cos(time + i * 0.7) * 0.2 // Reduced movement

        // Create radial gradient for each orb
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * intensityValue)

        const [r, g, b, a] = orb.color
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * intensityValue})`)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    // Start the animation
    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [intensity])

  return (
    <>
      {/* Fallback static background that will always be visible */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-[#0f0f0f] to-[#141414]"></div>

      {/* Canvas for animated background */}
      <canvas ref={canvasRef} className={cn("fixed inset-0 -z-10", className)} aria-hidden="true" />
    </>
  )
}
