import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with the secret key
const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables")
  }

  return new Stripe(secretKey)
}

// Get base URL without relying on VERCEL_URL
const getBaseUrl = () => {
  // First check for explicitly set base URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  // Fallback for local development
  return "http://localhost:3000"
}

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // Get Stripe client
    let stripe: Stripe
    try {
      stripe = getStripeClient()
    } catch (error) {
      console.error("Stripe initialization error:", error)
      return NextResponse.json(
        {
          error: "Stripe configuration error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // Get base URL
    const baseUrl = getBaseUrl()

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe portal session error:", error)
    return NextResponse.json(
      {
        error: "Error creating portal session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
