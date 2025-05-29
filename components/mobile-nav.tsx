"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabaseClient } from "@/lib/supabase"

interface MobileNavProps {
  links: {
    href: string
    label: string
  }[]
  onLogout?: () => Promise<void>
  isLoggingOut?: boolean
}

export function MobileNav({ links, onLogout, isLoggingOut = false }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, signOut } = useAuth()
  const [clientSideAuth, setClientSideAuth] = useState(false)
  const [localIsLoggingOut, setLocalIsLoggingOut] = useState(false)

  // Check authentication state directly from Supabase
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabaseClient.auth.getSession()
      setClientSideAuth(!!data.session)
    }

    checkAuth()
  }, [])

  // Use either the context auth state or the direct check
  const isUserAuthenticated = isAuthenticated || clientSideAuth

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setOpen(false)
    }
  }

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    } else {
      setLocalIsLoggingOut(true)
      try {
        await signOut()
        setClientSideAuth(false)
      } catch (error) {
        console.error("Error logging out:", error)
      } finally {
        setLocalIsLoggingOut(false)
      }
    }
    setOpen(false)
  }

  const isLoading = isLoggingOut || localIsLoggingOut

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs pt-16">
        <nav className="flex flex-col gap-4">
          {links.map((link) => {
            // Check if this is a hash link
            const isHashLink = link.href.startsWith("#")

            return isHashLink ? (
              <button
                key={link.href}
                className="text-left text-lg font-medium transition-colors hover:text-primary"
                onClick={() => scrollToSection(link.href.substring(1))}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-lg font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            )
          })}
          <div className="mt-4 flex flex-col gap-2">
            {isUserAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700">My Account</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full rounded-full flex items-center justify-center gap-2"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
