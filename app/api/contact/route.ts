import { NextResponse } from "next/server"
import { sendContactEmail } from "@/utils/email"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required" }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient()

    // Store form data in Supabase
    const { error: dbError } = await supabase.from("contact_forms").insert({
      name: name || "Anonymous", // Handle case where name is optional
      email,
      message,
    })

    if (dbError) {
      console.error("Error storing contact form in database:", dbError)
      // Continue with email sending even if database storage fails
    }

    // Send email using Resend
    try {
      await sendContactEmail({ name, email, message })
      return NextResponse.json({ success: true })
    } catch (emailError) {
      console.error("Error sending contact email:", emailError)
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: emailError instanceof Error ? emailError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing contact request:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
