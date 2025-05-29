/**
 * This script helps test Stripe webhooks locally
 * Run with: npx tsx scripts/test-webhooks.ts
 *
 * Prerequisites:
 * 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. Run `stripe login` to authenticate
 * 3. Run `stripe listen --forward-to localhost:3000/api/webhook` in a separate terminal
 */

import Stripe from "stripe"

// Initialize Stripe with your test secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function main() {
  try {
    console.log("Creating test customer...")
    const customer = await stripe.customers.create({
      email: "test@example.com",
      name: "Test User",
      metadata: {
        userId: "test-user-123",
      },
    })
    console.log(`Customer created: ${customer.id}`)

    console.log("Creating test subscription...")
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: "price_1OvBpBQhprQEuEmbaNn2kRxR", // Replace with your test price ID
        },
      ],
      metadata: {
        userId: "test-user-123",
      },
    })
    console.log(`Subscription created: ${subscription.id}`)

    // Wait for webhook events to be processed
    console.log("Waiting for webhook events to be processed...")
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Test subscription update
    console.log("Updating subscription...")
    await stripe.subscriptions.update(subscription.id, {
      metadata: {
        updated: "true",
      },
    })
    console.log(`Subscription updated: ${subscription.id}`)

    // Wait for webhook events to be processed
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Test subscription cancellation
    console.log("Cancelling subscription...")
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    })
    console.log(`Subscription cancelled at period end: ${subscription.id}`)

    // Wait for webhook events to be processed
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Test subscription deletion
    console.log("Deleting subscription...")
    await stripe.subscriptions.del(subscription.id)
    console.log(`Subscription deleted: ${subscription.id}`)

    console.log("Test completed successfully!")
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
