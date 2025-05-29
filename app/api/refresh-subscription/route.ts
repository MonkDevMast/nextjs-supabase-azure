import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { createAdminSupabaseClient } from "@/lib/admin-supabase"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
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

    // Fetch the latest subscription data
    const { data: subscription, error: subscriptionError } = await adminSupabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subscriptionError)
      return NextResponse.json({ error: "Error fetching subscription" }, { status: 500 })
    }

    // Fetch the latest usage data
    const { data: usage, error: usageError } = await adminSupabase
      .from("usage")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (usageError && usageError.code !== "PGRST116") {
      console.error("Error fetching usage:", usageError)
      return NextResponse.json({ error: "Error fetching usage" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      subscription,
      usage,
    })
  } catch (error) {
    console.error("Error refreshing subscription data:", error)
    return NextResponse.json(
      { error: "Failed to refresh subscription data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
