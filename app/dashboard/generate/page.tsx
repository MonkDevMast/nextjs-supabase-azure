import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { GenerateForm } from "@/components/dashboard/generate-form"

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Generate Wallpaper - Wallify",
  description: "Create beautiful wallpapers using AI",
}

export default async function GeneratePage() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id

  // Fetch user's subscription and usage info
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (subscriptionError && subscriptionError.code !== "PGRST116") {
    console.error("Error fetching subscription:", subscriptionError)
  }

  const { data: usage } = await supabase.from("usage").select("*").eq("user_id", userId).single()

  console.log("Generate page loaded with subscription data:", subscription)

  // Check if user has reached their limit
  const planLimits = {
    free: 5,
    starter: 100,
    pro: 250,
    unlimited: Number.POSITIVE_INFINITY,
  }

  const planType = subscription?.plan_type || "free"
  const limit = planLimits[planType as keyof typeof planLimits]
  const count = usage?.count || 0
  const canGenerate = count < limit

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-light tracking-tight">Generate Wallpaper</h2>
        <p className="text-zinc-400 text-base md:text-lg mt-1 md:mt-2">Create beautiful wallpapers using AI</p>
      </div>

      <GenerateForm
        userId={userId}
        canGenerate={canGenerate}
        planType={planType}
        currentUsage={count}
        usageLimit={limit}
      />
    </div>
  )
}
