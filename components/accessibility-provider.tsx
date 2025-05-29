"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, ZoomIn, Type, MousePointer2 } from "lucide-react"

interface AccessibilityContextType {
  fontSize: number
  setFontSize: (size: number) => void
  contrastMode: boolean
  setContrastMode: (enabled: boolean) => void
  reducedMotion: boolean
  setReducedMotion: (enabled: boolean) => void
  cursorSize: number
  setCursorSize: (size: number) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [fontSize, setFontSize] = useState(100) // 100%
  const [contrastMode, setContrastMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [cursorSize, setCursorSize] = useState(1) // 1x

  // Apply accessibility settings
  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}%`

    // Apply high contrast mode
    if (contrastMode) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }

    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion")
    } else {
      document.documentElement.classList.remove("reduced-motion")
    }

    // Apply cursor size
    document.documentElement.style.setProperty("--cursor-scale", cursorSize.toString())
  }, [fontSize, contrastMode, reducedMotion, cursorSize])

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem("accessibility-font-size")
    const savedContrastMode = localStorage.getItem("accessibility-contrast-mode")
    const savedReducedMotion = localStorage.getItem("accessibility-reduced-motion")
    const savedCursorSize = localStorage.getItem("accessibility-cursor-size")

    if (savedFontSize) setFontSize(Number.parseInt(savedFontSize))
    if (savedContrastMode) setContrastMode(savedContrastMode === "true")
    if (savedReducedMotion) setReducedMotion(savedReducedMotion === "true")
    if (savedCursorSize) setCursorSize(Number.parseFloat(savedCursorSize))
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("accessibility-font-size", fontSize.toString())
    localStorage.setItem("accessibility-contrast-mode", contrastMode.toString())
    localStorage.setItem("accessibility-reduced-motion", reducedMotion.toString())
    localStorage.setItem("accessibility-cursor-size", cursorSize.toString())
  }, [fontSize, contrastMode, reducedMotion, cursorSize])

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        contrastMode,
        setContrastMode,
        reducedMotion,
        setReducedMotion,
        cursorSize,
        setCursorSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function AccessibilityMenu() {
  const {
    fontSize,
    setFontSize,
    contrastMode,
    setContrastMode,
    reducedMotion,
    setReducedMotion,
    cursorSize,
    setCursorSize,
  } = useAccessibility()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Accessibility options">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <Label htmlFor="font-size">Font Size: {fontSize}%</Label>
              </div>
              <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setFontSize(100)}>
                Reset
              </Button>
            </div>
            <Slider
              id="font-size"
              min={75}
              max={200}
              step={5}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointer2 className="h-4 w-4" />
                <Label htmlFor="cursor-size">Cursor Size: {cursorSize}x</Label>
              </div>
              <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setCursorSize(1)}>
                Reset
              </Button>
            </div>
            <Slider
              id="cursor-size"
              min={1}
              max={2}
              step={0.1}
              value={[cursorSize]}
              onValueChange={(value) => setCursorSize(value[0])}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              <Label htmlFor="contrast-mode">High Contrast Mode</Label>
            </div>
            <Switch id="contrast-mode" checked={contrastMode} onCheckedChange={setContrastMode} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
            </div>
            <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
