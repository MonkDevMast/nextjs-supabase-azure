import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import "./accessibility.css"
import { Providers } from "./providers"
import { RedirectPreventer } from "@/components/redirect-preventer"
import { GlobalLogoutButton } from "@/components/global-logout-button"

// Load fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: {
    default: "WallScape.io - Wallpaper Generator",
    template: "%s | WallScape.io",
  },
  description: "Create beautiful, high-resolution wallpapers using text prompts and reference images.",
  openGraph: {
    title: "WallScape.io - Wallpaper Generator",
    description: "Create beautiful, high-resolution wallpapers using text prompts and reference images.",
    images: [{ url: "/og-image.jpg" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WallScape.io - Wallpaper Generator",
    description: "Create beautiful, high-resolution wallpapers using text prompts and reference images.",
    images: ["/og-image.jpg"],
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RedirectPreventer />
        <Providers>
          <GlobalLogoutButton />
          {children}
        </Providers>
      </body>
    </html>
  )
}
