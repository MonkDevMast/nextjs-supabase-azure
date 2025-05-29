"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ImageIcon,
  Users,
  Globe,
  Download,
  Lock,
  ShieldCheck,
  Star,
  Twitter,
  Instagram,
  Linkedin,
  LogOut,
  Loader2,
} from "lucide-react"
import { WallpaperGrid } from "@/components/wallpaper-grid"
import { ContactForm } from "@/components/contact-form"
import { NewsletterForm } from "@/components/newsletter-form"
import { EnhancedCTA } from "@/components/enhanced-cta"
import { TopBanner } from "@/components/top-banner"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/micro-interactions"
import { AppleGradientBackground } from "@/components/apple-gradient-background"
import { MobileNav } from "@/components/mobile-nav"
import { ScrollToSection } from "@/components/scroll-to-section"
import { Check } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// Sample testimonials data
const testimonials = [
  {
    id: "1",
    name: "John Doe",
    role: "Designer",
    content:
      "WallScape.io has completely transformed how I create backgrounds for my design projects. The quality is outstanding and saves me hours of work.",
    rating: 5,
  },
  {
    id: "2",
    name: "Alice Smith",
    role: "Content Creator",
    content:
      "I use WallScape.io for all my YouTube thumbnails and social media graphics. The system understands exactly what I'm looking for every time.",
    rating: 5,
  },
  {
    id: "3",
    name: "Robert Johnson",
    role: "Developer",
    content:
      "As a developer, I appreciate the clean API and the ability to generate wallpapers programmatically. The quality is consistently excellent.",
    rating: 5,
  },
  {
    id: "4",
    name: "Emily Chen",
    role: "Photographer",
    content:
      "Even as a professional photographer, I find myself using WallScape.io for creative inspiration. The AI understands composition and lighting beautifully.",
    rating: 4,
  },
]

// Key features for the features section
const keyFeatures = [
  {
    title: "Advanced AI Generation",
    description: "Create stunning wallpapers with just a text prompt using our state-of-the-art AI models.",
    icon: "✨",
  },
  {
    title: "Reference Image Upload",
    description: "Upload your own images as reference to guide the AI in creating similar styles.",
    icon: "🖼️",
  },
  {
    title: "Multiple Resolutions",
    description: "Generate wallpapers in various resolutions, from 1080p up to 4K for premium users.",
    icon: "📏",
  },
  {
    title: "Custom Aspect Ratios",
    description: "Choose from standard 16:9, ultrawide 21:9, mobile 9:16, and more aspect ratios.",
    icon: "📱",
  },
  {
    title: "Batch Generation",
    description: "Create multiple variations of your wallpaper idea in a single generation.",
    icon: "🔄",
  },
  {
    title: "Style Presets",
    description: "Choose from various style presets like photographic, digital art, anime, and more.",
    icon: "🎨",
  },
]

// Pricing plans - consistent with pricing page
const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Basic access to wallpaper generation",
    features: ["5 wallpapers per month", "1080p resolution"],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Starter",
    price: "$8.95",
    originalPrice: "$14.95",
    description: "More wallpapers with better quality",
    features: ["100 wallpapers per month", "2K resolution", "Image history for 30 days"],
    buttonText: "Choose Starter",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Unlimited",
    price: "$19.95",
    description: "Unlimited access to all features",
    features: [
      "Unlimited wallpapers",
      "4K resolution",
      "Reference image upload",
      "Batch download",
      "Priority processing",
      "Image history for 90 days",
      "Custom aspect ratios",
    ],
    buttonText: "Choose Unlimited",
    buttonVariant: "default" as const,
    popular: false,
  },
]

// Navigation links
const navLinks = [
  { href: "#features", label: "Features" },
  { href: "/dashboard", label: "Dashboard" },
]

export default function ClientPage() {
  // Use client-side only state to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()
  const initialRenderDone = useRef(false)
  const [clientSideAuth, setClientSideAuth] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true)
    initialRenderDone.current = true
  }, [])

  // Check authentication state directly from Supabase
  useEffect(() => {
    if (!isMounted) return

    const checkAuth = async () => {
      const { data } = await supabaseClient.auth.getSession()
      setClientSideAuth(!!data.session)
    }

    checkAuth()
  }, [isMounted])

  // Use either the context auth state or the direct check
  const isUserAuthenticated = isAuthenticated || clientSideAuth

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await signOut()

      // Force update client-side auth state
      setClientSideAuth(false)

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })

      // No need to redirect since we're already on the home page
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Aggressive approach to prevent any redirects
  useEffect(() => {
    if (!isMounted || !initialRenderDone.current) return

    // Prevent any navigation when the window regains focus
    const preventRedirects = (e: Event) => {
      e.stopPropagation()
      e.preventDefault()
      console.log("Preventing redirect on window event:", e.type)
      return false
    }

    // Capture and prevent all events that might trigger a redirect
    window.addEventListener("focus", preventRedirects, true)
    window.addEventListener("blur", preventRedirects, true)
    window.addEventListener("visibilitychange", preventRedirects, true)

    // Also prevent history changes
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function () {
      console.log("Preventing pushState")
      return originalPushState.apply(this, arguments)
    }

    history.replaceState = function () {
      console.log("Preventing replaceState")
      return originalReplaceState.apply(this, arguments)
    }

    return () => {
      window.removeEventListener("focus", preventRedirects, true)
      window.removeEventListener("blur", preventRedirects, true)
      window.removeEventListener("visibilitychange", preventRedirects, true)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [isMounted])

  const scrollToSection = (id: string) => {
    if (!isMounted) return

    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Don't render anything during SSR
  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Component to handle scroll to section */}
      <ScrollToSection />

      {/* Top banner - hidden by default */}
      <TopBanner
        title="Special Launch Offer"
        description="Get 40% off our Starter plan for the first 3 months"
        discount="40% OFF"
        code="LAUNCH40"
        ctaText="Claim Offer"
        ctaLink={isUserAuthenticated ? "/dashboard/pricing" : "/login"}
        display={false} // Set to false to hide the banner
      />

      {/* Animated background */}
      <AppleGradientBackground intensity="subtle" />

      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/50 border-b border-zinc-800">
        <div className="centered-container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            <span className="font-medium text-xl">WallScape.io</span>
          </Link>
          <div className="flex items-center space-x-4">
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => scrollToSection("features")}>
                Features
              </Button>
              {isUserAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700">
                      My Account
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full flex items-center gap-1.5"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        Logout
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
            {/* Mobile navigation */}
            <MobileNav links={navLinks} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero section with enhanced CTA */}
        <section className="w-full py-8 md:py-16 lg:py-24 relative">
          <div className="centered-container text-center">
            <FadeIn className="mx-auto max-w-3xl space-y-4 md:space-y-6 relative">
              {/* Static fallback background */}
              <div className="hero-background-fallback-neutral"></div>

              {/* Dynamic background that might disappear */}
              <div className="absolute inset-0 -z-10 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/30 to-zinc-900/30 backdrop-blur-sm"></div>
                <div className="absolute inset-0 bg-zinc-900/80"></div>
                <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-zinc-700/20 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-zinc-600/20 blur-3xl"></div>
                <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full bg-zinc-700/20 blur-3xl"></div>
              </div>

              {/* Hero content with the new hero-content class */}
              <div className="hero-content">
                <h1 className="font-light tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                  Create <span className="gradient-text">stunning wallpapers</span> instantly
                </h1>
                <p className="mx-auto text-sm sm:text-base md:text-lg text-zinc-300 mt-3 md:mt-4 max-w-2xl">
                  Generate beautiful, high-resolution wallpapers using text prompts and reference images.
                </p>
                <div className="mt-6 md:mt-8 flex justify-center">
                  <EnhancedCTA
                    primary={{
                      text: "Create Your First Wallpaper",
                      href: isUserAuthenticated ? "/dashboard/generate" : "/signup",
                    }}
                    size="lg"
                    highlight={true}
                    pulse={true}
                  />
                </div>
              </div>
            </FadeIn>

            {/* Process steps */}
            <StaggerContainer className="mt-8 md:mt-16 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <StaggerItem>
                  <div className="flex flex-col items-center p-4 card-hover-effect">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-3 md:mb-4">
                      <span className="text-lg md:text-xl font-bold text-blue-400">1</span>
                    </div>
                    <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">Describe Your Idea</h3>
                    <p className="text-xs md:text-sm text-zinc-400 text-center">
                      Enter a text prompt or upload a reference image
                    </p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="flex flex-col items-center p-4 card-hover-effect">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-3 md:mb-4">
                      <span className="text-lg md:text-xl font-bold text-blue-400">2</span>
                    </div>
                    <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">Generate</h3>
                    <p className="text-xs md:text-sm text-zinc-400 text-center">
                      Our system creates multiple wallpaper options
                    </p>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div className="flex flex-col items-center p-4 card-hover-effect">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-3 md:mb-4">
                      <span className="text-lg md:text-xl font-bold text-blue-400">3</span>
                    </div>
                    <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">Download</h3>
                    <p className="text-xs md:text-sm text-zinc-400 text-center">
                      Choose your favorite and download in high resolution
                    </p>
                  </div>
                </StaggerItem>
              </div>
            </StaggerContainer>

            <div className="mt-8 md:mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10"></div>
              {/* Use our WallpaperGrid component */}
              <WallpaperGrid />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-10 md:py-16 lg:py-24">
          <div className="centered-container">
            <FadeIn className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight mb-3 md:mb-4">Key Features</h2>
              <p className="text-sm md:text-base text-zinc-400">
                Discover what makes WallScape.io the best platform for creating stunning wallpapers
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {keyFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-zinc-900/50 rounded-xl p-4 md:p-6 border border-zinc-800 card-hover-effect"
                >
                  <div className="text-2xl md:text-3xl mb-3 md:mb-4">{feature.icon}</div>
                  <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <div className="mt-10 md:mt-16 py-8 md:py-12">
          <div className="centered-container">
            <StaggerContainer className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
              <StaggerItem className="flex-1 bg-black/20 rounded-xl p-4 md:p-6 flex flex-col items-center card-hover-effect">
                <Download className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2 md:mb-3" />
                <span className="text-xl md:text-2xl lg:text-3xl font-bold">250K+</span>
                <p className="text-xs md:text-sm text-zinc-400 mt-1 md:mt-2">Wallpapers Generated</p>
              </StaggerItem>
              <StaggerItem className="flex-1 bg-black/20 rounded-xl p-4 md:p-6 flex flex-col items-center card-hover-effect">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2 md:mb-3" />
                <span className="text-xl md:text-2xl lg:text-3xl font-bold">50K+</span>
                <p className="text-xs md:text-sm text-zinc-400 mt-1 md:mt-2">Active Users</p>
              </StaggerItem>
              <StaggerItem className="flex-1 bg-black/20 rounded-xl p-4 md:p-6 flex flex-col items-center card-hover-effect">
                <Globe className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2 md:mb-3" />
                <span className="text-xl md:text-2xl lg:text-3xl font-bold">120+</span>
                <p className="text-xs md:text-sm text-zinc-400 mt-1 md:mt-2">Countries Served</p>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-10 md:py-16">
          <div className="centered-container">
            <FadeIn className="text-center max-w-3xl mx-auto mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight mb-3 md:mb-4">
                What Our Users Say
              </h2>
              <p className="text-sm md:text-base text-zinc-400">
                Join thousands of satisfied users who are creating amazing wallpapers with WallScape.io
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-zinc-900/30 rounded-xl p-4 md:p-6 border border-zinc-800">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 md:mb-4">
                      <span className="text-base md:text-lg font-semibold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex items-center mb-3 md:mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < testimonial.rating
                              ? "h-3 w-3 md:h-4 md:w-4 text-yellow-500 fill-yellow-500"
                              : "h-3 w-3 md:h-4 md:w-4 text-gray-400"
                          }
                        />
                      ))}
                    </div>
                    <blockquote className="text-xs md:text-sm italic mb-3 md:mb-4">"{testimonial.content}"</blockquote>
                    <div>
                      <p className="text-sm md:text-base font-medium">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section - Consistent with pricing page */}
        <section id="pricing" className="py-10 md:py-16 lg:py-24 bg-black/20">
          <div className="centered-container">
            <FadeIn className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight mb-3 md:mb-4">
                Choose Your Plan
              </h2>
              <p className="text-sm md:text-base text-zinc-400">
                Select the perfect plan for your needs. All plans include access to our advanced wallpaper generation.
              </p>
            </FadeIn>

            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border ${plan.popular ? "border-primary shadow-md" : "border-zinc-800"} shadow-sm transition-transform duration-300 hover:scale-105 apple-card relative pt-6 overflow-visible`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground z-10">
                      Popular
                    </div>
                  )}
                  {plan.originalPrice && (
                    <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                      40% OFF
                    </div>
                  )}
                  <div className="p-4 md:p-5 border-b border-zinc-800">
                    <h3 className="text-lg md:text-xl font-medium">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-3 md:mt-4">
                      <span className="text-xl md:text-2xl lg:text-3xl font-bold">{plan.price}</span>
                      <span className="text-xs md:text-sm text-muted-foreground">/month</span>
                      {plan.originalPrice && (
                        <span className="ml-2 line-through text-zinc-500 text-xs md:text-sm">{plan.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>
                  <div className="p-4 md:p-5">
                    <ul className="space-y-2 md:space-y-3 text-xs md:text-sm mb-4 md:mb-5">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={isUserAuthenticated ? "/dashboard/pricing" : "/login"}>
                      <Button
                        variant={plan.buttonVariant}
                        className={`w-full rounded-full ${plan.name === "Unlimited" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <div className="mt-8 md:mt-12 max-w-3xl mx-auto bg-zinc-900/50 rounded-2xl p-4 md:p-6 border border-zinc-800 mx-4 sm:mx-auto">
          <p className="text-base md:text-lg font-light mb-3 md:mb-4 text-center">Trusted by creators worldwide</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center">
            <div className="text-center">
              <p className="text-lg md:text-xl lg:text-2xl font-light text-blue-400">10,000+</p>
              <p className="text-xs text-zinc-400">Wallpapers Created</p>
            </div>
            <div className="text-center">
              <p className="text-lg md:text-xl lg:text-2xl font-light text-blue-400">4.8/5</p>
              <p className="text-xs text-zinc-400">User Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg md:text-xl lg:text-2xl font-light text-blue-400">1,000+</p>
              <p className="text-xs text-zinc-400">Active Users</p>
            </div>
          </div>
          <div className="mt-3 md:mt-4 flex justify-center">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Powered by</span>
              <div className="bg-zinc-800 px-2 py-1 rounded text-xs">Vercel</div>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-6 md:py-8 lg:py-12 bg-zinc-900 border-t border-zinc-800 mt-8 md:mt-12">
        <div className="centered-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
            <div>
              <div className="flex flex-col items-start gap-3 md:gap-4">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center space-x-2 hover:text-primary transition-colors"
                >
                  <ImageIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <span className="font-medium text-lg md:text-xl">WallScape.io</span>
                </button>
                <p className="text-xs md:text-sm text-zinc-500">© 2025 WallScape.io. All rights reserved.</p>
                <div className="flex flex-wrap gap-3 md:gap-4 mt-1 md:mt-2">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Lock className="h-3 w-3 md:h-4 md:w-4 text-zinc-500" />
                    <span className="text-xs md:text-sm text-zinc-500">Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-zinc-500" />
                    <span className="text-xs md:text-sm text-zinc-500">Privacy Protected</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Contact Us</h3>
                <ContactForm />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Newsletter</h3>
                <p className="text-xs md:text-sm text-zinc-400 mb-3 md:mb-4">
                  Subscribe to our newsletter to get updates on new features and releases.
                </p>
                <NewsletterForm />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 pt-4 md:pt-6 border-t border-zinc-800">
            <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-zinc-500">
              <Link href="/terms" className="hover:text-blue-400 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                Privacy
              </Link>
            </div>
            <div className="flex gap-3 md:gap-4">
              <a
                href="#"
                aria-label="Twitter"
                className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-blue-900/30 transition-colors"
              >
                <Twitter className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-blue-900/30 transition-colors"
              >
                <Instagram className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-blue-900/30 transition-colors"
              >
                <Linkedin className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />
              </a>
            </div>
          </div>
        </div>
      </footer>
      <div className="fixed bottom-4 right-4 left-4 mx-auto max-w-xs md:hidden">
        <Link href={isUserAuthenticated ? "/dashboard/generate" : "/signup"}>
          <Button className="w-full rounded-full py-3 shadow-lg bg-blue-600 hover:bg-blue-700">
            Create Your Wallpaper
          </Button>
        </Link>
      </div>
    </div>
  )
}
