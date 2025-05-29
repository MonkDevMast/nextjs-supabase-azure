import { type Stripe, loadStripe } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null>

// Get Stripe publishable key from environment variables
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      console.error("Missing STRIPE_PUBLISHABLE_KEY environment variable")
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Plan details matching the screenshot
export const PLAN_DETAILS = {
  free: {
    name: "Free",
    price: "$0",
    description: "Basic access to wallpaper generation",
    features: ["5 wallpapers per month", "1080p resolution"],
    priceId: null, // Free plan doesn't need a price ID
  },
  starter: {
    name: "Starter",
    price: "$8.95",
    originalPrice: "$14.95",
    description: "More wallpapers with better quality",
    features: ["100 wallpapers per month", "2K resolution", "Image history for 30 days"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
  },
  unlimited: {
    name: "Unlimited",
    price: "$19.95",
    description: "Unlimited access to all features",
    features: [
      "Unlimited wallpapers",
      "4K resolution",
      "Reference image upload",
      "Batch download",
      "Priority processing",
      "Image history for 90 days",
      "Custom aspect ratios",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID,
  },
}

// Plan limits for usage tracking
export const PLAN_LIMITS = {
  free: {
    maxGenerations: 5,
    resolution: "1080p",
    historyDays: 0,
  },
  starter: {
    maxGenerations: 100,
    resolution: "2K",
    historyDays: 30,
  },
  unlimited: {
    maxGenerations: Number.POSITIVE_INFINITY,
    resolution: "4K",
    historyDays: 90,
  },
}
