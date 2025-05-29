import ClientPage from "./ClientPage"

// Update the metadata
export const metadata = {
  title: "WallScape.io - AI Wallpaper Generator",
  description: "Create beautiful, high-resolution wallpapers using AI and text prompts.",
}

// Make sure this file isn't causing any redirects

// If there's any client-side code here that might be redirecting based on auth state,
// we need to modify it. If it's just a simple server component, we can leave it as is.

// If there's a redirect happening here, replace it with:
export default function Home() {
  return <ClientPage />
}
