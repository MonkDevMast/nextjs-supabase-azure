import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminSupabaseClient } from "@/lib/admin-supabase"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { userId, subscriptionId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`Processing downgrade to free plan for user ${userId}`)

    // Initialize Stripe if we have a subscription ID
    let stripe: Stripe | null = null
    if (subscriptionId) {
      try {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        console.log(`Initialized Stripe for subscription ${subscriptionId}`)
      } catch (stripeError) {
        console.error("Error initializing Stripe:", stripeError)
        // Continue with the downgrade process even if Stripe initialization fails
      }
    }

    // Get admin Supabase client to bypass RLS
    const adminSupabase = createAdminSupabaseClient()

    // Get user Supabase client to check auth
    const supabase = createServerSupabaseClient()

    // Verify the user is authenticated
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session || sessionData.session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Cancel the subscription in Stripe if it exists
    if (stripe && subscriptionId) {
      try {
        console.log(`Cancelling Stripe subscription ${subscriptionId}`)
        await stripe.subscriptions.cancel(subscriptionId, {
          invoice_now: false,
          prorate: true,
        })
        console.log(`Successfully cancelled Stripe subscription ${subscriptionId}`)
      } catch (cancelError) {
        console.error("Error cancelling Stripe subscription:", cancelError)
        // Continue with the downgrade process even if Stripe cancellation fails
      }
    }

    // Add this new block to delete the Stripe customer:
    // Get the Stripe customer ID from the subscription record
    try {
      const { data: subscriptionData, error: fetchError } = await adminSupabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .single()

      if (fetchError) {
        console.error("Error fetching subscription data:", fetchError)
      } else if (subscriptionData?.stripe_customer_id && stripe) {
        // Delete the Stripe customer
        try {
          console.log(`Deleting Stripe customer ${subscriptionData.stripe_customer_id}`)
          await stripe.customers.del(subscriptionData.stripe_customer_id)
          console.log(`Successfully deleted Stripe customer ${subscriptionData.stripe_customer_id}`)
        } catch (deleteCustomerError) {
          console.error("Error deleting Stripe customer:", deleteCustomerError)
          // Continue with the downgrade process even if customer deletion fails
        }
      }
    } catch (customerError) {
      console.error("Error handling Stripe customer deletion:", customerError)
      // Continue with the downgrade process even if there's an error
    }

    // 2. Delete the subscription record from Supabase
    try {
      console.log(`Deleting subscription record for user ${userId}`)
      const { error: deleteError } = await adminSupabase.from("subscriptions").delete().eq("user_id", userId)

      if (deleteError) {
        console.error("Error deleting subscription record:", deleteError)
        return NextResponse.json(
          { error: "Failed to delete subscription record", details: deleteError },
          { status: 500 },
        )
      }
      console.log(`Successfully deleted subscription record for user ${userId}`)
    } catch (dbError) {
      console.error("Error in database operation:", dbError)
      return NextResponse.json(
        { error: "Database error", details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 },
      )
    }

    // 3. Update usage limits to free plan
    try {
      console.log(`Updating usage limits for user ${userId} to free plan`)
      const { data: existingUsage, error: fetchError } = await adminSupabase
        .from("usage")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching usage record:", fetchError)
      }

      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + 1) // One month from now

      if (existingUsage) {
        // Update existing usage record
        const { error: updateError } = await adminSupabase
          .from("usage")
          .update({
            monthly_generation: 5, // Free plan limit
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId)

        if (updateError) {
          console.error("Error updating usage limits:", updateError)
        } else {
          console.log(`Usage limits updated for user ${userId} to 5 generations (free plan)`)
        }
      } else {
        // Create new usage record
        const { error: insertError } = await adminSupabase.from("usage").insert({
          user_id: userId,
          monthly_generation: 5, // Free plan limit
          count: 0,
          total_generations: 0,
          reset_date: periodEnd.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })

        if (insertError) {
          console.error("Error creating usage record:", insertError)
        } else {
          console.log(`Usage record created for user ${userId} with 5 generations (free plan)`)
        }
      }
    } catch (usageError) {
      console.error("Error updating usage limits:", usageError)
      // Continue with the downgrade process even if updating usage limits fails
    }

    // 4. Try to record the subscription change in history if the table exists
    try {
      const { error: historyError } = await adminSupabase.from("subscription_history").insert({
        user_id: userId,
        action: "downgrade",
        from_plan: "paid", // Generic since we're deleting the record
        to_plan: "free",
        created_at: new Date().toISOString(),
      })

      if (historyError && historyError.code !== "PGRST116") {
        console.error("Error recording subscription history:", historyError)
        // This is optional, so continue even if it fails
      }
    } catch (historyError) {
      console.error("Error with subscription history:", historyError)
      // This is optional, so continue even if it fails
    }

    console.log(`Successfully downgraded user ${userId} to free plan`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in downgrade-to-free API:", error)
    return NextResponse.json(
      { error: "Failed to downgrade to free plan", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
