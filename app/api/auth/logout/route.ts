import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Create a response object
    const response = NextResponse.json({ success: true })

    // Get the cookie store
    const cookieStore = cookies()

    // Get all cookies
    const allCookies = cookieStore.getAll()

    // Find auth-related cookies and set them to expire in the response
    for (const cookie of allCookies) {
      if (cookie.name.includes("supabase") || cookie.name.includes("sb-") || cookie.name.includes("auth")) {
        // Add Set-Cookie header to expire the cookie
        response.headers.append("Set-Cookie", `${cookie.name}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`)
      }
    }

    return response
  } catch (error: any) {
    console.error("Error signing out:", error)
    return NextResponse.json(
      {
        error: "Failed to sign out",
        details: error.message,
      },
      {
        status: 500,
      },
    )
  }
}
