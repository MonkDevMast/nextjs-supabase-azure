import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { WallpaperGrid } from "@/components/dashboard/wallpaper-grid"
import { SubscriptionStatus } from "@/components/dashboard/subscription-status"
import { UsageProgress } from "@/components/dashboard/usage-progress"

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Dashboard - WallScape",
  description: "Manage your generated wallpapers and account",
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id
  console.log(`************************* here is profile user id ******************* ${userId}`);
  // const profiles = await supabase.from('profiles').select('*');

  // Fetch user profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  console.log(profile)
  // console.log(profiles);
  console.log(error)
  // Fetch user's wallpapers
  const { data: wallpapers } = await supabase
    .from("wallpapers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6)

  // Fetch subscription info with no-cache option and handle the case when no record exists
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (subscriptionError && subscriptionError.code !== "PGRST116") {
    console.error("Error fetching subscription:", subscriptionError)
  }

  console.log("Dashboard loaded with subscription data:", subscription || "No subscription found (free plan)")

  // Fetch usage info with no-cache option
  const { data: usage } = await supabase.from("usage").select("*").eq("user_id", userId).single()

  console.log("Dashboard loaded with subscription data:", subscription)

  return (
    <div className="space-y-6 md:space-y-8">
      <DashboardHeader displayName={profile?.display_name || "User"} avatarUrl={profile?.avatar_url} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DashboardStats wallpaperCount={wallpapers?.length || 0} planType={subscription?.plan_type || "free"} />
        </div>
        <div>
          <SubscriptionStatus subscription={subscription} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WallpaperGrid wallpapers={wallpapers || []} />
        </div>
        <div>
          <UsageProgress usage={usage} planType={subscription?.plan_type || "free"} />
        </div>
      </div>
    </div>
  )
}
