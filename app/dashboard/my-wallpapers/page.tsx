import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { HistoryWallpaperGrid } from "@/components/dashboard/history-wallpaper-grid"

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = "force-dynamic"

export const metadata = {
  title: "My Wallpapers - WallScape",
  description: "View and manage your saved wallpapers",
}

export default async function MyWallpapersPage() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id

  // Fetch all user's wallpapers
  const { data: wallpapers } = await supabase
    .from("wallpapers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-light tracking-tight">My Wallpapers</h2>
        <p className="text-zinc-400 text-base md:text-lg mt-1 md:mt-2">View and manage all your generated wallpapers</p>
      </div>

      <HistoryWallpaperGrid wallpapers={wallpapers || []} />
    </div>
  )
}
