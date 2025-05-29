"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase"

export function GlobalLogoutButton() {
  const { user, signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  // Check for session on client side
  useEffect(() => {
    setIsClient(true)

    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession()
      setHasSession(!!data.session)
    }

    checkSession()
  }, [])

  // Don't show on auth pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-email" ||
    pathname === "/verify-email-change"

  // Don't show on home page - we'll handle logout in the header there
  const isHomePage = pathname === "/"

  // Show the button if we have a user from context OR a session from direct check
  // But not on auth pages or home page
  if ((!user && !hasSession) || isAuthPage || !isClient || isHomePage) {
    return null
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await signOut()

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })

      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full bg-black/30 backdrop-blur-sm border-zinc-700"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </>
        )}
      </Button>
    </div>
  )
}
