import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Database } from "@/types/supabase"
import { InfoIcon } from "lucide-react"

type Usage = Database["public"]["Tables"]["usage"]["Row"]

interface UsageProgressProps {
  usage: Usage | null
  planType: string
}

export function UsageProgress({ usage, planType }: UsageProgressProps) {
  // Define limits based on plan type
  const getLimit = () => {
    switch (planType) {
      case "starter":
        return 100
      case "pro":
        return 250
      case "unlimited":
        return Number.POSITIVE_INFINITY
      case "free":
      default:
        return 5
    }
  }

  const limit = getLimit()
  const count = usage?.count || 0
  const percentage = limit === Number.POSITIVE_INFINITY ? 0 : Math.min(Math.round((count / limit) * 100), 100)

  // Format the period end date - try multiple fields to ensure we have a date
  let periodEndDate = "N/A"

  if (usage) {
    // Try reset_date first
    if (usage.reset_date) {
      periodEndDate = new Date(usage.reset_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    }
    // Then try period_end
    else if (usage.period_end) {
      periodEndDate = new Date(usage.period_end).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    }
  }

  return (
    <Card className="apple-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {count} / {limit === Number.POSITIVE_INFINITY ? "∞" : limit} wallpapers
            </span>
            <span className="text-sm text-zinc-400">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2 rounded-full" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Resets On</span>
          <span className="text-sm">{periodEndDate}</span>
        </div>

        {percentage > 80 && planType !== "unlimited" && (
          <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-500 flex items-start gap-2">
            <InfoIcon className="h-5 w-5 flex-shrink-0" />
            <p>You're approaching your monthly limit. Consider upgrading your plan for more wallpapers.</p>
          </div>
        )}
      </CardContent>
      {planType !== "unlimited" && (
        <CardFooter>
          <Link href="/dashboard/pricing" className="w-full">
            <Button variant="outline" className="w-full rounded-full">
              Upgrade for More
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
