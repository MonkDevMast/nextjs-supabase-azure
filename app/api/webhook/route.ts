import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"
import { createAdminSupabaseClient } from "@/lib/admin-supabase"

// Initialize Stripe with the secret key
const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables")
  }

  return new Stripe(secretKey)
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
    },
  })
}

// This is a raw handler that doesn't use the default body parser
export async function POST(req: Request) {
  console.log("Webhook endpoint called!")

  try {
    const rawBody = await req.text()
    console.log("Received webhook payload length:", rawBody.length)

    const signature = headers().get("stripe-signature")
    console.log("Stripe signature:", signature ? "Present" : "Missing")

    if (!signature) {
      console.error("Missing stripe-signature header")
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    let event: Stripe.Event

    // Get Stripe client
    const stripe = getStripeClient()

    // Use admin Supabase client to bypass RLS
    const supabase = createAdminSupabaseClient()

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    console.log("Webhook secret:", webhookSecret ? "Present" : "Missing")

    // Verify webhook signature
    try {
      if (!webhookSecret) {
        console.warn("STRIPE_WEBHOOK_SECRET is not set. Skipping signature verification.")
        event = JSON.parse(rawBody) as Stripe.Event
      } else {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
      }

      console.log(`Successfully verified webhook: ${event.id}`)
      console.log(`Received webhook event: ${event.type}`)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    // Handle specific events with try/catch for each handler
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          console.log("Processing checkout.session.completed event")
          const session = event.data.object as Stripe.Checkout.Session
          await handleCheckoutSessionCompleted(session, supabase, stripe)
          break
        }

        case "customer.subscription.created": {
          console.log("Processing customer.subscription.created event")
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionCreated(subscription, supabase, stripe)
          break
        }

        case "customer.subscription.updated": {
          console.log("Processing customer.subscription.updated event")
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionUpdated(subscription, supabase, stripe)
          break
        }

        case "customer.subscription.deleted": {
          console.log("Processing customer.subscription.deleted event")
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionDeleted(subscription, supabase, stripe)
          break
        }

        case "invoice.payment_succeeded": {
          console.log("Processing invoice.payment_succeeded event")
          const invoice = event.data.object as Stripe.Invoice
          await handleInvoicePaymentSucceeded(invoice, supabase, stripe)
          break
        }

        case "invoice.payment_failed": {
          console.log("Processing invoice.payment_failed event")
          const invoice = event.data.object as Stripe.Invoice
          await handleInvoicePaymentFailed(invoice, supabase, stripe)
          break
        }

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (handlerError) {
      console.error(`Error handling event ${event.type}:`, handlerError)
      // Return 200 anyway to prevent Stripe from retrying
      return NextResponse.json({
        received: true,
        warning: `Error processing event ${event.type}, but acknowledged receipt`,
        error: handlerError instanceof Error ? handlerError.message : String(handlerError),
      })
    }

    console.log("Webhook processing completed successfully")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    // Return 200 anyway to prevent Stripe from retrying
    return NextResponse.json({
      received: true,
      error: "Webhook handler encountered an error, but acknowledged receipt",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

// Handler functions for different webhook events

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any, stripe: Stripe) {
  try {
    console.log("Processing checkout.session.completed:", session.id)

    const userId = session.metadata?.userId
    const planName = session.metadata?.planName
    const priceId = session.metadata?.priceId

    // Handle case where subscription might be undefined or null
    const subscriptionId = session.subscription
      ? typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id
      : null
    const customerId = session.customer
      ? typeof session.customer === "string"
        ? session.customer
        : session.customer.id
      : null

    if (!userId) {
      console.warn("Missing userId in checkout session metadata:", session.id)
      return
    }

    console.log(`Checkout completed for user ${userId}, plan ${planName}, subscription ${subscriptionId}`)

    // Skip subscription retrieval if subscriptionId is null
    let subscription: Stripe.Subscription | null = null
    let currentPeriodStart: Date = new Date()
    let currentPeriodEnd: Date = new Date()
    let finalPlanType = planName?.toLowerCase() || "unknown"
    const finalPlanId = priceId || null

    if (subscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId)
        currentPeriodStart = new Date(subscription.current_period_start * 1000)
        currentPeriodEnd = new Date(subscription.current_period_end * 1000)

        // Get plan type from price nickname if available
        if (subscription.items.data.length > 0) {
          const price = subscription.items.data[0].price
          if (price && price.nickname) {
            // Extract plan type from nickname (e.g., "Starter Plan" -> "starter")
            finalPlanType = price.nickname.split(" ")[0].toLowerCase()
            console.log(`Extracted plan type from price nickname: ${finalPlanType}`)
          }
        }
      } catch (subError) {
        console.error("Error retrieving subscription:", subError)
        // Continue with default dates if subscription retrieval fails
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1) // Default to 1 month from now
        finalPlanType = planName?.toLowerCase() || "free"
      }
    } else {
      console.log("No subscription ID found in checkout session, using default period")
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1) // Default to 1 month from now
    }

    const subscriptionStatus = subscription?.status || "active"

    // Update the subscription in Supabase
    console.log(`Updating subscription for user ${userId} with new plan details`)
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan_id: finalPlanId,
        plan_type: finalPlanType,
        status: subscriptionStatus,
        cancel_at_period_end: false, // Always set to false for new subscriptions
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating subscription in database:", updateError)

      // If update fails, try to insert a new record
      console.log(`Attempting to create new subscription record for user ${userId}`)
      const { error: insertError } = await supabase.from("subscriptions").insert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan_id: finalPlanId,
        plan_type: finalPlanType,
        status: subscriptionStatus,
        cancel_at_period_end: false, // Always set to false for new subscriptions
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating new subscription record:", insertError)
      } else {
        console.log(`New subscription record created for user ${userId}`)
      }
    } else {
      console.log(`Subscription updated for user ${userId}: ${finalPlanType} (${subscriptionStatus})`)
    }

    // Update usage limits based on the new plan
    await updateUserUsageLimits(userId, finalPlanType, supabase)

    console.log(`User ${userId} subscribed to ${finalPlanType} plan until ${currentPeriodEnd}`)
  } catch (error) {
    console.error("Error handling checkout.session.completed:", error)
    throw error
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any, stripe: Stripe) {
  try {
    console.log("Processing customer.subscription.created:", subscription.id)

    // Get customer ID and metadata
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id

    let userId: string | undefined

    try {
      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
      userId = customer.metadata.userId
    } catch (customerError) {
      console.error("Error retrieving customer:", customerError)
      // Try to get userId from subscription metadata as fallback
      userId = subscription.metadata?.userId
    }

    if (!userId) {
      console.warn("No userId found in customer metadata or subscription metadata:", customerId)
      return
    }

    // Get product details and plan type
    let planName = "unknown"
    let priceId = null

    try {
      if (subscription.items.data.length > 0) {
        const price = subscription.items.data[0].price
        priceId = price.id

        // First try to get plan type from price nickname
        if (price.nickname) {
          // Extract plan type from nickname (e.g., "Starter Plan" -> "starter")
          planName = price.nickname.split(" ")[0].toLowerCase()
          console.log(`Extracted plan type from price nickname: ${planName}`)
        }
        // Fallback to product name if nickname is not available
        else if (typeof price.product === "string") {
          const product = await stripe.products.retrieve(price.product)
          planName = product.name.toLowerCase().replace(/\s+/g, "_")
          console.log(`Extracted plan type from product name: ${planName}`)
        }
      }
    } catch (productError) {
      console.error("Error retrieving product details:", productError)
      // Use fallback from metadata if available
      planName = subscription.metadata?.planName?.toLowerCase() || "unknown"
    }

    // Check if user already has a subscription record
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching existing subscription:", fetchError)
    }

    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    if (existingSubscription) {
      // Update existing subscription
      console.log(`Updating existing subscription for user ${userId}`)
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          plan_id: priceId,
          plan_type: planName,
          status: subscription.status,
          cancel_at_period_end: false, // Always set to false for new subscriptions
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating subscription in database:", updateError)
      } else {
        console.log(`Subscription updated for user ${userId}: ${planName} (${subscription.status})`)
      }
    } else {
      // Create new subscription
      console.log(`Creating new subscription for user ${userId}`)
      const { error: insertError } = await supabase.from("subscriptions").insert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_id: priceId,
        plan_type: planName,
        status: subscription.status,
        cancel_at_period_end: false, // Always set to false for new subscriptions
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error inserting subscription in database:", insertError)
      } else {
        console.log(`Subscription created for user ${userId}: ${planName} (${subscription.status})`)
      }
    }

    // Update usage limits based on the new plan
    await updateUserUsageLimits(userId, planName, supabase)

    console.log(`Subscription created for user ${userId}: ${planName} (${subscription.status})`)
  } catch (error) {
    console.error("Error handling customer.subscription.created:", error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any, stripe: Stripe) {
  try {
    console.log("Processing customer.subscription.updated:", subscription.id)

    // Get customer ID and metadata
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id

    let userId: string | undefined

    try {
      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
      userId = customer.metadata.userId
    } catch (customerError) {
      console.error("Error retrieving customer:", customerError)
      // Try to get userId from subscription metadata as fallback
      userId = subscription.metadata?.userId
    }

    if (!userId) {
      console.warn("No userId found in customer metadata or subscription metadata:", customerId)
      return
    }

    // Get product details and plan type
    let planName = "unknown"
    let priceId = null

    try {
      if (subscription.items.data.length > 0) {
        const price = subscription.items.data[0].price
        priceId = price.id

        // First try to get plan type from price nickname
        if (price.nickname) {
          // Extract plan type from nickname (e.g., "Starter Plan" -> "starter")
          planName = price.nickname.split(" ")[0].toLowerCase()
          console.log(`Extracted plan type from price nickname: ${planName}`)
        }
        // Fallback to product name if nickname is not available
        else if (typeof price.product === "string") {
          const product = await stripe.products.retrieve(price.product)
          planName = product.name.toLowerCase().replace(/\s+/g, "_")
          console.log(`Extracted plan type from product name: ${planName}`)
        }
      }
    } catch (productError) {
      console.error("Error retrieving product details:", productError)
      // Use fallback from metadata if available
      planName = subscription.metadata?.planName?.toLowerCase() || "unknown"
    }

    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const cancelAtPeriodEnd = subscription.cancel_at_period_end

    // Update subscription in database
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_id: priceId,
        plan_type: planName,
        status: subscription.status,
        cancel_at_period_end: cancelAtPeriodEnd, // This should reflect the actual Stripe subscription state
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating subscription in database:", updateError)
    } else {
      console.log(`Subscription updated for user ${userId}: ${planName} (${subscription.status})`)
    }

    // Update usage limits based on the updated plan
    await updateUserUsageLimits(userId, planName, supabase)

    console.log(`Subscription updated for user ${userId}: ${subscription.status}`)
  } catch (error) {
    console.error("Error handling customer.subscription.updated:", error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any, stripe: Stripe) {
  try {
    console.log("Processing customer.subscription.deleted:", subscription.id)

    // Get customer ID and metadata
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id

    let userId: string | undefined

    try {
      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
      userId = customer.metadata.userId
    } catch (customerError) {
      console.error("Error retrieving customer:", customerError)
      // Try to get userId from subscription metadata as fallback
      userId = subscription.metadata?.userId
    }

    if (!userId) {
      console.warn("No userId found in customer metadata or subscription metadata:", customerId)
      return
    }

    // Update subscription in database to free plan
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        plan_type: "free",
        plan_id: null,
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating subscription in database:", updateError)
    } else {
      console.log(`Subscription deleted for user ${userId}, reverted to free plan`)
    }

    // Update usage limits to free plan
    await updateUserUsageLimits(userId, "free", supabase)

    console.log(`Subscription deleted for user ${userId}`)
  } catch (error) {
    console.error("Error handling customer.subscription.deleted:", error)
    throw error
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any, stripe: Stripe) {
  try {
    console.log("Processing invoice.payment_succeeded:", invoice.id)

    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log("Skipping non-subscription invoice:", invoice.id)
      return
    }

    const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id

    let userId: string | undefined
    let subscription: Stripe.Subscription | null = null

    try {
      // Get subscription details
      subscription = await stripe.subscriptions.retrieve(subscriptionId)

      // Try to get customer details
      try {
        const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
        userId = customer.metadata.userId
      } catch (customerError) {
        console.error("Error retrieving customer:", customerError)
        // Try to get userId from subscription metadata as fallback
        userId = subscription.metadata?.userId
      }
    } catch (subError) {
      console.error("Error retrieving subscription:", subError)
      // Try to get userId directly from invoice metadata as last resort
      userId = invoice.metadata?.userId
    }

    if (!userId) {
      console.warn("No userId found in customer, subscription, or invoice metadata:", customerId)
      return
    }

    // If we have a subscription, update the period end date
    if (subscription) {
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

      // Update subscription period end date
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          current_period_end: currentPeriodEnd.toISOString(),
          status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating subscription period end:", updateError)
      } else {
        console.log(`Subscription period updated for user ${userId} to ${currentPeriodEnd}`)
      }
    } else {
      console.log(`No subscription details available for invoice ${invoice.id}, skipping period update`)
    }

    console.log(`Invoice payment succeeded for user ${userId}`)
  } catch (error) {
    console.error("Error handling invoice.payment_succeeded:", error)
    throw error
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any, stripe: Stripe) {
  try {
    console.log("Processing invoice.payment_failed:", invoice.id)

    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log("Skipping non-subscription invoice:", invoice.id)
      return
    }

    const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id

    let userId: string | undefined
    let subscription: Stripe.Subscription | null = null

    try {
      // Get subscription details
      subscription = await stripe.subscriptions.retrieve(subscriptionId)

      // Try to get customer details
      try {
        const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
        userId = customer.metadata.userId
      } catch (customerError) {
        console.error("Error retrieving customer:", customerError)
        // Try to get userId from subscription metadata as fallback
        userId = subscription.metadata?.userId
      }
    } catch (subError) {
      console.error("Error retrieving subscription:", subError)
      // Try to get userId directly from invoice metadata as last resort
      userId = invoice.metadata?.userId
    }

    if (!userId) {
      console.warn("No userId found in customer, subscription, or invoice metadata:", customerId)
      return
    }

    // If we have a subscription, update the status
    if (subscription) {
      // Update subscription status
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating subscription status:", updateError)
      } else {
        console.log(`Subscription status updated for user ${userId} to ${subscription.status}`)
      }
    } else {
      console.log(`No subscription details available for invoice ${invoice.id}, skipping status update`)
    }

    console.log(`Invoice payment failed for user ${userId}`)
  } catch (error) {
    console.error("Error handling invoice.payment_failed:", error)
    throw error
  }
}

// Helper function to update user usage limits based on plan
async function updateUserUsageLimits(userId: string, planType: string, supabase: any) {
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
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1) // One month from now

    if (existingUsage) {
      // Update existing usage record
      const { error: updateError } = await supabase
        .from("usage")
        .update({
          monthly_generation: maxGenerations,
          updated_at: now.toISOString(),
        })
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating usage limits:", updateError)
      } else {
        console.log(`Usage limits updated for user ${userId} to ${maxGenerations} generations`)
      }
    } else {
      // Create new usage record
      const { error: insertError } = await supabase.from("usage").insert({
        user_id: userId,
        monthly_generation: maxGenerations,
        count: 0,
        total_generations: 0,
        reset_date: periodEnd.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })

      if (insertError) {
        console.error("Error creating usage record:", insertError)
      } else {
        console.log(`Usage record created for user ${userId} with ${maxGenerations} generations`)
      }
    }
  } catch (error) {
    console.error("Error updating user usage limits:", error)
  }
}
