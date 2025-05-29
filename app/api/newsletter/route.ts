import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("Received newsletter subscription request")

  try {
    // Parse the request body
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.error("Invalid email format:", email)
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    console.log(`Processing newsletter subscription for email: ${email}`)

    // Track success states
    let emailSent = false
    let databaseSaved = false

    // 1. Store the email in Supabase
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        console.log("Attempting to save email to Supabase...")

        const response = await fetch(`${supabaseUrl}/rest/v1/newsletter`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ email }),
        })

        if (response.ok) {
          console.log("Email successfully saved to Supabase newsletter table")
          databaseSaved = true
        } else {
          const errorText = await response.text()

          // Check if it's a duplicate email error
          if (
            response.status === 409 ||
            errorText.includes("duplicate key") ||
            errorText.includes("newsletter_email_key")
          ) {
            console.log("Email already exists in the newsletter database")
            databaseSaved = true // Consider this a success since the email is in the database
          } else {
            console.error("Error saving to Supabase:", response.status, errorText)
          }
        }
      } else {
        console.warn("Supabase environment variables not available")
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError instanceof Error ? dbError.message : "Unknown error")
    }

    // 2. Send email notification with HTML
    try {
      const { Resend } = await import("resend")
      const resendApiKey = process.env.RESEND_API_KEY

      if (resendApiKey) {
        const resend = new Resend(resendApiKey)

        const { data, error } = await resend.emails.send({
          from: "WallScape.io <onboarding@resend.dev>",
          to: ["silverstring@gmail.com"],
          subject: "New Newsletter Subscription",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">New Newsletter Subscription</h1>
              <p style="font-size: 16px; line-height: 1.5;">
                You have a new newsletter subscription from: <strong>${email}</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.5;">
                Time: ${new Date().toLocaleString()}
              </p>
              <p style="font-size: 16px; line-height: 1.5;">
                Database save status: ${databaseSaved ? "Successful" : "Failed"}
              </p>
            </div>
          `,
        })

        if (error) {
          console.error("Error sending newsletter confirmation:", error)
        } else {
          console.log("Newsletter confirmation email sent successfully")
          emailSent = true
        }
      } else {
        console.warn("Resend API key not available")
      }
    } catch (emailError) {
      console.error("Error in email sending process:", emailError)
    }

    // 3. Return appropriate response based on what succeeded
    if (databaseSaved && emailSent) {
      return NextResponse.json(
        {
          success: true,
          message: "Thank you for subscribing to our newsletter! A confirmation email has been sent.",
        },
        { status: 200 },
      )
    } else if (databaseSaved) {
      return NextResponse.json(
        {
          success: true,
          message: "Thank you for subscribing to our newsletter! (Confirmation email could not be sent)",
        },
        { status: 200 },
      )
    } else if (emailSent) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Your subscription request was received, but we couldn't save it to our database. Our team has been notified.",
        },
        { status: 200 },
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "We encountered an issue processing your subscription. Please try again later.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing newsletter subscription:", error)
    return NextResponse.json({ success: false, message: "Error processing subscription" }, { status: 500 })
  }
}
