import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Failed to get session", details: sessionError.message }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { full_name } = session.user.user_metadata || {}
    const displayName = full_name || session.user.email?.split("@")[0] || "User"

    console.log("Creating profile for user:", userId)

    // Check if profile already exists - don't throw error if not found
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle()

    if (existingProfile) {
      console.log("Profile already exists for user:", userId)
      return NextResponse.json({ success: true, message: "Profile already exists" })
    }

    // Create user profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      display_name: displayName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return NextResponse.json({ error: "Failed to create profile", details: profileError.message }, { status: 500 })
    }

    console.log("Profile created successfully for user:", userId)

    // Create subscription record (free plan)
    const { error: subscriptionError } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_type: "free",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (subscriptionError) {
      console.error("Error creating subscription:", subscriptionError)
      // Continue even if subscription creation fails
    } else {
      console.log("Subscription created successfully for user:", userId)
    }

    // Create usage record
    const { error: usageError } = await supabase.from("usage").insert({
      user_id: userId,
      count: 0,
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    })

    if (usageError) {
      console.error("Error creating usage record:", usageError)
      // Continue even if usage creation fails
    } else {
      console.log("Usage record created successfully for user:", userId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error creating user profile:", error)
    return NextResponse.json(
      { error: "Failed to create user profile", details: error.message || String(error) },
      { status: 500 },
    )
  }
}
