import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase"
import { createAdminSupabaseClient } from "@/lib/admin-supabase"

// Initialize Stripe with the secret key
const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not defined in environment variables")
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables")
  }

  return new Stripe(secretKey)
}

// Get base URL for redirects
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  return "http://localhost:3000"
}

export async function POST(request: Request) {
  try {
    const { priceId, planName, userId } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`Processing checkout for user ${userId}, plan ${planName}, priceId ${priceId}`)

    // Get Stripe client
    const stripe = getStripeClient()

    // Get Supabase client
    const supabase = createServerSupabaseClient()

    // Get admin Supabase client for direct DB operations
    const adminSupabase = createAdminSupabaseClient()

    // Get user session to get email
    const { data: sessionData } = await supabase.auth.getSession()
    const userEmail = sessionData.session?.user?.email

    if (!userEmail) {
      console.error("User email not found in session")
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    console.log(`User email: ${userEmail}`)

    // Check if user already has a Stripe customer ID and subscription
    const { data: subscription, error: subscriptionError } = await adminSupabase
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", userId)
      .maybeSingle()

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subscriptionError)
    }
    console.log(subscription);
    console.log(`Existing subscription for user ${userId}`);
    let customerId = subscription?.stripe_customer_id

    // Create a new customer if one doesn't exist
    if (!customerId) {
      console.log("Creating new Stripe customer")
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      })
      console.log('**************************** here is created customer ***********************');
      console.log(customer);
      customerId = customer.id
    } else {
      console.log(`Using existing Stripe customer: ${customerId}`)
    }

    // If user has an existing subscription in Stripe, cancel it at period end
    if (subscription?.stripe_subscription_id) {
      try {
        console.log(
          `Cancelling existing Stripe subscription ${subscription.stripe_subscription_id} before creating new one`,
        )

        // Cancel the subscription in Stripe only
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        })

        console.log(`Existing Stripe subscription cancelled at period end`)

        // Delete the existing subscription record in Supabase
        console.log(`Deleting existing subscription record in Supabase for user ${userId}`)
        const { error: deleteError } = await adminSupabase.from("subscriptions").delete().eq("user_id", userId)

        if (deleteError) {
          console.error("Error deleting existing subscription in Supabase:", deleteError)
        } else {
          console.log(`Existing subscription record deleted from Supabase for user ${userId}`)
        }
      } catch (cancelError) {
        console.error("Error cancelling existing subscription in Stripe:", cancelError)
        // Continue with checkout even if cancellation fails
      }
    }

    // Create a new subscription record in Supabase with cancel_at_period_end set to false
    console.log(`Creating new subscription record in Supabase for user ${userId}`)
    const { error: insertError } = await adminSupabase.from("subscriptions").insert({
      user_id: userId,
      stripe_customer_id: customerId,
      plan_type: "pending", // Will be updated after checkout
      plan_id: null, // Will be updated after checkout
      status: "pending",
      cancel_at_period_end: false, // Explicitly set to false for new subscription
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error creating new subscription record in Supabase:", insertError)
    } else {
      console.log(`New subscription record created in Supabase for user ${userId}`)
    }

    // Get base URL for redirects
    const baseUrl = getBaseUrl()

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planName}&user_id=${userId}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        userId,
        planName,
        priceId,
      },
      customer: customerId,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      client_reference_id: userId,
    })

    console.log(`Created checkout session: ${session.id}`)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      {
        error: "Error creating checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
