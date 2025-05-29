import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    // If there's no code, this isn't an auth callback
    if (!code) {
      console.log("No code provided in auth callback")
      return NextResponse.redirect(`${requestUrl.origin}/login`)
    }

    console.log("Auth callback received with code")

    // Create a response to store the session
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options })
            })
          },
        },
      },
    )

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
    }

    // If we have a user, create their profile if needed
    if (data.user) {
      try {
        console.log("Checking if profile exists for user:", data.user.id)

        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle()

        if (!existingProfile) {
          console.log("Profile doesn't exist, creating one for user:", data.user.id)

          // Get user details
          const email = data.user.email || ""
          const fullName = data.user.user_metadata?.full_name || ""
          const displayName = fullName || email.split("@")[0] || "User"

          // Create user profile with correct column names
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            email: email,
            full_name: fullName || null,
            display_name: displayName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Error creating profile:", profileError)
          } else {
            console.log("Profile created successfully for user:", data.user.id)

            // Create subscription record with correct column names
            try {
              const { error: subscriptionError } = await supabase.from("subscriptions").insert({
                user_id: data.user.id,
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
                console.log("Subscription created successfully for user:", data.user.id)
              }
            } catch (subscriptionError) {
              console.error("Exception creating subscription:", subscriptionError)
            }

            // Create usage record with correct column names
            try {
              const { error: usageError } = await supabase.from("usage").insert({
                user_id: data.user.id,
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
                console.log("Usage record created successfully for user:", data.user.id)
              }
            } catch (usageError) {
              console.error("Exception creating usage record:", usageError)
            }
          }
        } else {
          console.log("Profile already exists for user:", data.user.id)
        }
      } catch (profileError) {
        console.error("Error checking/creating profile:", profileError)
      }
    }

    // Create a response with the session cookie
    const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    return response
  } catch (error) {
    console.error("Error in auth callback:", error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=ServerError`)
  }
}
