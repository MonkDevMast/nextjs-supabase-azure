import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, Calendar, CreditCard } from "lucide-react"

interface ProfileStatsProps {
  wallpaperCount: number
  planType: string
  joinDate: string
}

export function ProfileStats({ wallpaperCount, planType, joinDate }: ProfileStatsProps) {
  // Format the plan type for display
  const formattedPlanType = planType.charAt(0).toUpperCase() + planType.slice(1)

  // Format the join date
  const formattedJoinDate = new Date(joinDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="apple-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Account Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
            <ImageIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Wallpapers Created</p>
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
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Member Since</p>
            <p className="text-xl font-medium">{formattedJoinDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
