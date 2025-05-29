import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { ProfileView } from "@/components/profile/profile-view"
import { ProfileStats } from "@/components/profile/profile-stats"

export const metadata = {
  title: "My Profile - Wallify",
  description: "View and edit your profile information",
}

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id

  // Fetch user profile with all fields
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  // Fetch user's wallpapers count
  const { count: wallpaperCount } = await supabase
    .from("wallpapers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Fetch subscription info
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", userId).single()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-light tracking-tight">My Profile</h2>
        <p className="text-zinc-400 text-base md:text-lg mt-1 md:mt-2">View and edit your profile information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ProfileView profile={profile} userEmail={session.user.email || ""} />
        </div>
        <div>
          <ProfileStats
            wallpaperCount={wallpaperCount || 0}
            planType={subscription?.plan_type || "free"}
            joinDate={profile?.created_at || new Date().toISOString()}
          />
        </div>
      </div>
    </div>
  )
}
