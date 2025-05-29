import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon, CreditCard, Clock } from "lucide-react"

interface DashboardStatsProps {
  wallpaperCount: number
  planType: string
}

export function DashboardStats({ wallpaperCount, planType }: DashboardStatsProps) {
  // Format the plan type for display
  const formattedPlanType = planType.charAt(0).toUpperCase() + planType.slice(1)

  // Get the current date for display
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="apple-card">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Quick Stats</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <ImageIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Wallpapers</p>
              <p className="text-xl font-medium">{wallpaperCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <CreditCard className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Current Plan</p>
              <p className="text-xl font-medium">{formattedPlanType}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Today's Date</p>
              <p className="text-xl font-medium">{currentDate}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
