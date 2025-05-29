import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user session
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "No authenticated user" }, { status: 401 })
    }

    // Test direct insert with minimal data
    const testData = {
      user_id: userId,
      plan_type: "free",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    // First try to delete any existing subscription for this user
    const { error: deleteError } = await supabase.from("subscriptions").delete().eq("user_id", userId)

    if (deleteError) {
      return NextResponse.json(
        {
          error: "Failed to delete existing subscription",
          details: deleteError,
        },
        { status: 500 },
      )
    }

    // Now try to insert a new subscription
    const { data, error: insertError } = await supabase.from("subscriptions").insert(testData).select()

    if (insertError) {
      return NextResponse.json(
        {
          error: "Failed to insert subscription",
          details: insertError,
          data: testData,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test subscription created successfully",
      data,
    })
  } catch (error) {
    console.error("Debug subscription error:", error)
    return NextResponse.json(
      {
        error: "Debug subscription failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
