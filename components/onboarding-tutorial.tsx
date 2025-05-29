"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface TutorialStep {
  title: string
  description: string
  image?: string
  targetElement?: string
  position?: "top" | "right" | "bottom" | "left"
}

interface OnboardingTutorialProps {
  steps: TutorialStep[]
  onComplete?: () => void
  onSkip?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function OnboardingTutorial({
  steps,
  onComplete,
  onSkip,
  isOpen: controlledIsOpen,
  onOpenChange,
}: OnboardingTutorialProps) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? true)
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  const open = controlledIsOpen ?? isOpen
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setIsOpen(value)
    }
  }

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const step = steps[currentStep]
      if (!step.targetElement) return

      const element = document.querySelector(step.targetElement)
      if (!element) return

      const rect = element.getBoundingClientRect()
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      })

      // Scroll element into view if needed
      if (rect.top < 0 || rect.left < 0 || rect.bottom > window.innerHeight || rect.right > window.innerWidth) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [currentStep, steps, open])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setOpen(false)
    onComplete?.()
  }

  const handleSkip = () => {
    setOpen(false)
    onSkip?.()
  }

  if (!open) return null

  const step = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!step.targetElement) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    }

    const pos = step.position || "bottom"
    const margin = 12 // margin from target element

    switch (pos) {
      case "top":
        return {
          bottom: `calc(100% - ${position.top}px + ${margin}px)`,
          left: `${position.left + position.width / 2}px`,
          transform: "translateX(-50%)",
        }
      case "right":
        return {
          top: `${position.top + position.height / 2}px`,
          left: `${position.left + position.width + margin}px`,
          transform: "translateY(-50%)",
        }
      case "bottom":
        return {
          top: `${position.top + position.height + margin}px`,
          left: `${position.left + position.width / 2}px`,
          transform: "translateX(-50%)",
        }
      case "left":
        return {
          top: `${position.top + position.height / 2}px`,
          right: `calc(100% - ${position.left}px + ${margin}px)`,
          transform: "translateY(-50%)",
        }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleSkip} />

      {/* Highlight target element */}
      {step.targetElement && (
        <div
          className="absolute z-10 rounded-lg ring-4 ring-primary pointer-events-none"
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height,
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute z-20 w-80 max-w-[calc(100vw-2rem)]"
          style={getTooltipPosition()}
        >
          <Card className="shadow-xl border-primary/20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-lg">{step.title}</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSkip}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

              {step.image && (
                <div className="mb-4 rounded-md overflow-hidden">
                  <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-auto object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        index === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted",
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <Button variant="outline" size="sm" className="h-8 px-2" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}

                  <Button size="sm" className="h-8" onClick={handleNext}>
                    {isLastStep ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
