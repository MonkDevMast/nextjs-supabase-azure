"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopBannerProps {
  title: string
  description: string
  discount: string
  code?: string
  ctaText: string
  ctaLink: string
  className?: string
  display?: boolean
}

export function TopBanner({
  title,
  description,
  discount,
  code,
  ctaText,
  ctaLink,
  className,
  display = false,
}: TopBannerProps) {
  const [isVisible, setIsVisible] = useState(display)
  const [copied, setCopied] = useState(false)

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
    <div className={cn("w-full bg-gradient-to-r from-blue-900/80 to-purple-900/80 py-2 px-4", className)}>
      <div className="centered-container flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-grow">
          <div className="font-medium text-primary">{discount}</div>
          <div className="text-sm">
            {title}: {description}
          </div>
          {code && (
            <div className="hidden md:flex items-center gap-2">
              <div
                className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md font-mono text-xs cursor-pointer"
                onClick={copyCode}
              >
                {code}
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={copyCode}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="rounded-full h-7 px-3 text-xs">
            <a href={ctaLink}>
              {ctaText}
              <ArrowRight className="ml-1 h-3 w-3" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleClose}>
            <X className="h-3 w-3" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
