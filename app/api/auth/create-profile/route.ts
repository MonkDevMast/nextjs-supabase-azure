import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body to get the user data
    const { userId, displayName, email, fullName } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("Creating profile for user ID:", userId, "with email:", email)

    // Use the server-side client with admin privileges
    const supabase = createServerSupabaseClient()

    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle()

    if (existingProfile) {
      console.log("Profile already exists for user:", userId)
      return NextResponse.json({ success: true, message: "Profile already exists" })
    }

    // Create user profile with correct column names
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email: email || null,
      full_name: fullName || null,
      display_name: displayName || (email ? email.split("@")[0] : "User"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return NextResponse.json({ error: "Failed to create profile", details: profileError.message }, { status: 500 })
    }

    console.log("Profile created successfully for user:", userId)

    // Create subscription record with correct column names
    try {
      const { error: subscriptionError } = await supabase.from("subscriptions").insert({
        user_id: userId,
        plan_type: "free",
        plan_id: "free_plan",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError)
      } else {
        console.log("Subscription created successfully for user:", userId)
      }
    } catch (subscriptionError) {
      console.error("Exception creating subscription:", subscriptionError)
      // Continue even if subscription creation fails
    }

    // Create usage record with correct column names
    try {
      const { error: usageError } = await supabase.from("usage").insert({
        user_id: userId,
        monthly_generations: 0,
        count: 0,
        total_generations: 0,
        reset_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (usageError) {
        console.error("Error creating usage record:", usageError)
      } else {
        console.log("Usage record created successfully for user:", userId)
      }
    } catch (usageError) {
      console.error("Exception creating usage record:", usageError)
      // Continue even if usage creation fails
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in create-profile API:", error)
    return NextResponse.json(
      {
        error: "Failed to create user profile",
        details: error.message || String(error),
      },
      { status: 500 },
    )
  }
}
