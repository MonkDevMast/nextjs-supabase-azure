import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { SubscriptionStatus } from "@/components/dashboard/subscription-status"

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Account - WallScape",
  description: "Manage your account settings and subscription",
}

export default async function AccountPage() {
  alert("This is AccountPgae!")
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id
  alert(userId)

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
  console.log("Profile:", profile)
  // Fetch subscription info with no-cache option
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", userId).single()
  console.log("Subscription:", subscription)
  console.log("Account page loaded with subscription data:", subscription)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-light tracking-tight">Account</h2>
        <p className="text-zinc-400 text-lg mt-2">Manage your account settings and subscription</p>
      </div>

      <SubscriptionStatus subscription={subscription} />

      {/* Other account sections can go here */}
    </div>
  )
}
