import type React from "react"
import { Suspense } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { ProfileInitializer } from "@/components/profile-initializer"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileInitializer userId={session.user.id} />
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardNav />
      </Suspense>
      <main className="mt-6">{children}</main>
    </div>
  )
}
