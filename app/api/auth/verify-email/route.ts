import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Verify the email change
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email_change",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ error: "Failed to verify email", details: error.message }, { status: 500 })
  }
}
