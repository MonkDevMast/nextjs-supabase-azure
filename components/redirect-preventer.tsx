"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function RedirectPreventer() {
  const pathname = usePathname()

  useEffect(() => {
    // Only apply to the home page
    if (pathname !== "/") return

    console.log("RedirectPreventer active for home page")

    // Prevent any navigation when the window regains focus
    const preventRedirects = (e: Event) => {
      e.stopPropagation()
      console.log("Preventing redirect on window event:", e.type)
    }

    // Capture and prevent all events that might trigger a redirect
    window.addEventListener("focus", preventRedirects, true)
    window.addEventListener("blur", preventRedirects, true)
    window.addEventListener("visibilitychange", preventRedirects, true)

    return () => {
      window.removeEventListener("focus", preventRedirects, true)
      window.removeEventListener("blur", preventRedirects, true)
      window.removeEventListener("visibilitychange", preventRedirects, true)
    }
  }, [pathname])

  return null // This component doesn't render anything
}
