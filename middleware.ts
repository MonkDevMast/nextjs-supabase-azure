import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

export async function middleware(request: NextRequest) {
  try {
    // Get the current path
    const path = request.nextUrl.pathname

    // Skip middleware for webhook and API endpoints
    if (
      path === "/api/webhook" ||
      path.includes("/api/webhook") ||
      path === "/api/create-subscription" ||
      path.includes("/api/create-subscription")
    ) {
      console.log("Middleware: Skipping auth check for API endpoint:", path)
      return NextResponse.next()
    }

    // Skip middleware completely for the home page
    if (request.nextUrl.pathname === "/") {
      return NextResponse.next()
    }

    // Create a response object
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Skip middleware for static assets and API routes (except webhook which we already handled)
    if (
      path === "/" || // Explicitly skip the home page
      path.includes("/_next") ||
      (path.includes("/api/") && !path.includes("/api/webhook") && !path.includes("/api/create-subscription")) || // Skip other API routes but not webhook
      path.includes("/auth/") ||
      path.includes("/favicon.ico") ||
      path.endsWith(".png") ||
      path.endsWith(".jpg") ||
      path.endsWith(".svg") ||
      path.endsWith(".css") ||
      path.endsWith(".js")
    ) {
      return response
    }

    // Create a Supabase client for authentication checks
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({
                name,
                value,
                ...options,
              })
            })

            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })

            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set({
                name,
                value,
                ...options,
              })
            })
          },
        },
      },
    )

    // Check if the user has an active session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Define protected routes
    const isProtectedRoute = path.startsWith("/dashboard") || path.startsWith("/account") || path === "/profile"

    // Define auth routes
    const isAuthRoute =
      path === "/login" || path === "/signup" || path === "/forgot-password" || path === "/reset-password"

    // For protected routes, redirect to login only if not authenticated
    if (isProtectedRoute && !session) {
      console.log("Redirecting to login: No session found for protected route", path)
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", path)
      return NextResponse.redirect(url)
    }

    // For auth routes, redirect to dashboard if already authenticated
    if (isAuthRoute && session) {
      console.log("Redirecting to dashboard: User already authenticated")
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    // Return the response
    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // Return a basic response to prevent the application from crashing
    return NextResponse.next()
  }
}

// Explicitly exclude the webhook endpoint from middleware
export const config = {
  matcher: [
    // Exclude the webhook endpoint and home page
    "/((?!api/webhook)(?!api/create-subscription)(?!$).*)",
    // Include specific paths
    "/dashboard/:path*",
    "/account/:path*",
    "/profile",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
}
