import { createServerSupabaseClient } from "@/lib/supabase"

async function initializeSubscription(userId: string) {
  try {
    console.log(`Initializing subscription for user ${userId}`)
    const supabase = createServerSupabaseClient()

    // Check if subscription already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching existing subscription:", fetchError)
      return
    }

    if (existingSubscription) {
      console.log(`Subscription already exists for user ${userId}`)
      return
    }

    // Create new subscription
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1) // One month from now

    const { error: insertError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_type: "free",
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })

    if (insertError) {
      console.error("Error creating subscription:", insertError)
      return
    }

    console.log(`Created subscription for user ${userId}`)

    // Create usage record
    const { error: usageError } = await supabase.from("usage").insert({
      user_id: userId,
      monthly_generation: 5, // Free plan
      count: 0,
      total_generations: 0,
      reset_date: periodEnd.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })

    if (usageError) {
      console.error("Error creating usage record:", usageError)
      return
    }

    console.log(`Created usage record for user ${userId}`)
  } catch (error) {
    console.error("Error initializing subscription:", error)
  }
}

// Usage: npx tsx scripts/initialize-subscription.ts USER_ID
const userId = process.argv[2]
if (userId) {
  initializeSubscription(userId)
} else {
  console.error("Please provide a user ID")
}
