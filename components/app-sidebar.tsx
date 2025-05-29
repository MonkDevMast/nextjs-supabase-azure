"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CreditCard, Home, Image, LogOut, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/sidebar-provider"
import { useToast } from "@/hooks/use-toast"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { isOpen, isMobile } = useSidebar()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Generate",
      icon: Image,
      href: "/dashboard/generate",
      active: pathname === "/dashboard/generate",
    },
    {
      label: "Account",
      icon: User,
      href: "/dashboard/account",
      active: pathname === "/dashboard/account",
    },
    {
      label: "Pricing",
      icon: CreditCard,
      href: "/dashboard/pricing",
      active: pathname === "/dashboard/pricing",
    },
    // {
    //   label: "Settings",
    //   icon: Settings,
    //   href: "/dashboard/settings",
    //   active: pathname === "/dashboard/settings",
    // },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to log out")
      }

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })

      router.push("/login")
      router.refresh()
    } catch (error: any) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!isOpen && !isMobile) {
    return (
      <aside className="fixed left-0 flex h-full w-16 flex-col border-r bg-background z-30">
        <div className="flex h-14 items-center justify-center border-b">
          <Link href="/dashboard">
            <div className="flex items-center justify-center rounded-full bg-primary h-6 w-6 text-primary-foreground text-xs font-bold">
              W
            </div>
          </Link>
        </div>
        <nav className="flex flex-col items-center gap-4 p-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
                route.active && "bg-primary/10 text-primary",
              )}
            >
              <route.icon className="h-5 w-5" />
              <span className="sr-only">{route.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
        isMobile && !isOpen && "-translate-x-full",
        className,
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            W
          </div>
          <span className="font-semibold">WallScape.io</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2">
        <nav className="flex flex-col gap-1 py-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
                route.active && "bg-primary/10 text-primary",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="h-5 w-5" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </aside>
  )
}
