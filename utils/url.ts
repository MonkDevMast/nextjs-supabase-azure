/**
 * Gets the base URL of the application
 * This function works in both client and server contexts
 */
export function getBaseUrl(): string {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // Server-side: check for explicitly set base URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  // Fallback for local development
  return "http://localhost:3000"
}
