"use client"

import { Check, X, HelpCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface Feature {
  name: string
  description?: string
  free: boolean | string | number
  starter: boolean | string | number
  pro: boolean | string | number
  unlimited: boolean | string | number
}

interface FeatureComparisonProps {
  features: Feature[]
  highlightedPlan?: "free" | "starter" | "pro" | "unlimited"
  onSelectPlan?: (plan: string) => void
  className?: string
}

export function FeatureComparison({ features, highlightedPlan, onSelectPlan, className }: FeatureComparisonProps) {
  const router = useRouter()

  const renderValue = (value: boolean | string | number) => {
    if (typeof value === "boolean") {
      return (
        <div className="flex justify-center">
          {value ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
        </div>
      )
    }
    return value
  }

  const handleSelectPlan = (plan: string) => {
    if (onSelectPlan) {
      onSelectPlan(plan)
    } else {
      router.push(`/pricing?plan=${plan}`)
    }
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <TooltipProvider>
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="border-b border-zinc-800">
              <TableHead className="w-[250px] py-4">Feature</TableHead>
              <TableHead className="text-center py-4">
                <div className="flex flex-col items-center">
                  <span>Free</span>
                  <span className="text-sm text-muted-foreground">$0/mo</span>
                </div>
              </TableHead>
              <TableHead className="text-center py-4">
                <div
                  className={cn(
                    "flex flex-col items-center rounded-lg py-2 px-4 mx-auto",
                    highlightedPlan === "starter" && "bg-primary/10 border border-primary/20",
                  )}
                >
                  <span>Starter</span>
                  <span className="text-sm text-muted-foreground">$8.95/mo</span>
                  {highlightedPlan === "starter" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs mt-1 bg-primary/20 px-2 py-0.5 rounded-full text-primary"
                    >
                      Popular
                    </motion.div>
                  )}
                </div>
              </TableHead>
              <TableHead className="text-center py-4">
                <div
                  className={cn(
                    "flex flex-col items-center rounded-lg py-2 px-4 mx-auto",
                    highlightedPlan === "pro" && "bg-primary/10 border border-primary/20",
                  )}
                >
                  <span>Pro</span>
                  <span className="text-sm text-muted-foreground">$9.99/mo</span>
                </div>
              </TableHead>
              <TableHead className="text-center py-4">
                <div
                  className={cn(
                    "flex flex-col items-center rounded-lg py-2 px-4 mx-auto",
                    highlightedPlan === "unlimited" && "bg-primary/10 border border-primary/20",
                  )}
                >
                  <span>Unlimited</span>
                  <span className="text-sm text-muted-foreground">$19.95/mo</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, index) => (
              <TableRow key={index} className={cn("border-b border-zinc-800", index % 2 === 0 && "bg-zinc-900/30")}>
                <TableCell className="font-medium py-4">
                  <div className="flex items-center gap-1">
                    {feature.name}
                    {feature.description && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{feature.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center py-4">{renderValue(feature.free)}</TableCell>
                <TableCell className="text-center py-4">{renderValue(feature.starter)}</TableCell>
                <TableCell className="text-center py-4">{renderValue(feature.pro)}</TableCell>
                <TableCell className="text-center py-4">{renderValue(feature.unlimited)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="flex justify-center">
          <Button variant="outline" className="rounded-full w-full" onClick={() => handleSelectPlan("free")}>
            Get Started
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            className={cn(
              "rounded-full w-full",
              highlightedPlan === "starter" ? "bg-primary" : "bg-blue-600 hover:bg-blue-500",
            )}
            onClick={() => handleSelectPlan("starter")}
          >
            Choose Starter
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            className={cn(
              "rounded-full w-full",
              highlightedPlan === "pro" ? "bg-primary" : "bg-blue-600 hover:bg-blue-500",
            )}
            onClick={() => handleSelectPlan("pro")}
          >
            Choose Pro
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            className={cn(
              "rounded-full w-full",
              highlightedPlan === "unlimited" ? "bg-primary" : "bg-blue-600 hover:bg-blue-500",
            )}
            onClick={() => handleSelectPlan("unlimited")}
          >
            Choose Unlimited
          </Button>
        </div>
      </div>
    </div>
  )
}
