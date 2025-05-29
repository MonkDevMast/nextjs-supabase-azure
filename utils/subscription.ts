import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Check if a subscription is active
 */
export async function isSubscriptionActive(subscriptionId: string): Promise<boolean> {
  if (!subscriptionId) return false

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription.status === "active"
  } catch (error) {
    console.error("Error checking subscription status:", error)
    return false
  }
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  if (!subscriptionId) return null

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Get the product details for the subscription
    const productId = subscription.items.data[0].price.product as string
    const product = await stripe.products.retrieve(productId)

    return {
      id: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      productName: product.name,
      productDescription: product.description,
    }
  } catch (error) {
    console.error("Error fetching subscription details:", error)
    return null
  }
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!subscriptionId) return false

  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return true
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return false
  }
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<boolean> {
  if (!subscriptionId) return false

  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
    return true
  } catch (error) {
    console.error("Error reactivating subscription:", error)
    return false
  }
}
