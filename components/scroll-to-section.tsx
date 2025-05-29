"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function ScrollToSection() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if we're on the homepage and there's a hash in the URL
    if (pathname === "/" && window.location.hash) {
      const id = window.location.hash.substring(1) // Remove the # character
      const element = document.getElementById(id)

      if (element) {
        // Use setTimeout to ensure the scroll happens after the page is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    }
  }, [pathname])

  return null // This component doesn't render anything
}
