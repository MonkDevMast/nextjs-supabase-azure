import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/admin-supabase"

export async function POST(request: Request) {
  try {
    const { userId, customerId, subscriptionId, planType, priceId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`Creating subscription record for user ${userId}`)

    // Use admin client to bypass RLS
    const supabase = createAdminSupabaseClient()

    // Check if subscription already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching existing subscription:", fetchError)
      return NextResponse.json({ error: "Error fetching subscription" }, { status: 500 })
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1) // One month from now

    if (existingSubscription) {
      // Delete the existing subscription record
      console.log(`Deleting existing subscription record for user ${userId}`)
      const { error: deleteError } = await supabase.from("subscriptions").delete().eq("user_id", userId)

      if (deleteError) {
        console.error("Error deleting existing subscription:", deleteError)
        // Continue with update as fallback if delete fails

        // Update existing subscription
        console.log(`Updating existing subscription for user ${userId}`)
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            stripe_customer_id: customerId || existingSubscription.stripe_customer_id,
            stripe_subscription_id: subscriptionId || existingSubscription.stripe_subscription_id,
            plan_id: priceId || existingSubscription.plan_id,
            plan_type: planType || existingSubscription.plan_type,
            status: "active",
            cancel_at_period_end: false, // Always set to false for new/updated subscriptions
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId)

        if (updateError) {
          console.error("Error updating subscription:", updateError)
          return NextResponse.json({ error: "Error updating subscription", details: updateError }, { status: 500 })
        }
      } else {
        // Create new subscription after successful deletion
        console.log(`Creating new subscription record for user ${userId} after deletion`)
        const { error: insertError } = await supabase.from("subscriptions").insert({
          user_id: userId,
          stripe_customer_id: customerId || null,
          stripe_subscription_id: subscriptionId || null,
          plan_id: priceId || null,
          plan_type: planType || "free",
          status: "active",
          cancel_at_period_end: false, // Always set to false for new subscriptions
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })

        if (insertError) {
          console.error("Error creating subscription after deletion:", insertError)
          return NextResponse.json({ error: "Error creating subscription", details: insertError }, { status: 500 })
        }
      }
    } else {
      // Create new subscription
      console.log(`Creating new subscription for user ${userId}`)
      const { error: insertError } = await supabase.from("subscriptions").insert({
        user_id: userId,
        stripe_customer_id: customerId || null,
        stripe_subscription_id: subscriptionId || null,
        plan_id: priceId || null,
        plan_type: planType || "free",
        status: "active",
        cancel_at_period_end: false, // Always set to false for new subscriptions
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })

      if (insertError) {
        console.error("Error creating subscription:", insertError)
        return NextResponse.json({ error: "Error creating subscription", details: insertError }, { status: 500 })
      }
    }

    // Also create/update usage record
    await createOrUpdateUsageRecord(userId, planType || "free", supabase)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in create-subscription API:", error)
    return NextResponse.json(
      { error: "Failed to create subscription", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

async function createOrUpdateUsageRecord(userId: string, planType: string, supabase: any) {
  try {
    // Get the max generations based on plan type
    let maxGenerations = 5 // Default for free plan

    if (planType === "starter") {
      maxGenerations = 100
    } else if (planType === "unlimited") {
      maxGenerations = 999999 // Effectively unlimited
    }

    // Check if user has a usage record
    const { data: existingUsage, error: fetchError } = await supabase
      .from("usage")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching usage record:", fetchError)
      return
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1) // One month from now

    if (existingUsage) {
      // Update existing usage record
      const { error: updateError } = await supabase
        .from("usage")
        .update({
          monthly_generations: maxGenerations,
          updated_at: now.toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating usage limits:", updateError)
      }
    } else {
      // Create new usage record
      const { error: insertError } = await supabase.from("usage").insert({
        user_id: userId,
        monthly_generations: maxGenerations,
        count: 0,
        total_generations: 0,
        reset_date: periodEnd.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })

      if (insertError) {
        console.error("Error creating usage record:", insertError)
      }
    }
  } catch (error) {
    console.error("Error updating user usage limits:", error)
  }
}
