import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface DashboardHeaderProps {
  displayName: string
  avatarUrl?: string | null
}

export function DashboardHeader({ displayName, avatarUrl }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">Welcome, {displayName}!</h2>
        </div>
        <p className="text-zinc-400 text-base md:text-lg mt-1 md:mt-2">
          Here's an overview of your wallpaper generation activity.
        </p>
      </div>
      <Link href="/dashboard/generate">
        <Button className="rounded-full px-4 md:px-6 gap-1.5 bg-blue-600 hover:bg-blue-700 mt-3 md:mt-0">
          <Plus className="h-4 w-4" />
          New Wallpaper
        </Button>
      </Link>
    </div>
  )
}
