import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminSupabaseClient } from "@/lib/admin-supabase"

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // Reactivate the subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    // Get the user ID from the subscription metadata
    let userId = subscription.metadata?.userId

    // If not in metadata, try to get from customer
    if (!userId) {
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id
      try {
        const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
        userId = customer.metadata.userId
      } catch (error) {
        console.error("Error retrieving customer:", error)
      }
    }

    // Update the subscription in Supabase
    if (userId) {
      const supabase = createAdminSupabaseClient()
      const { error } = await supabase
        .from("subscriptions")
        .update({
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) {
        console.error("Error updating subscription in Supabase:", error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reactivating subscription:", error)
    return NextResponse.json(
      {
        error: "Error reactivating subscription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
