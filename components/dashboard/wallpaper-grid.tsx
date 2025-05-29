"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Download, Trash2, Plus } from "lucide-react" // Remove Edit from here
import type { Database } from "@/types/supabase"
import { useState } from "react"
import { supabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type Wallpaper = Database["public"]["Tables"]["wallpapers"]["Row"]

interface WallpaperGridProps {
  wallpapers: Wallpaper[]
}

export function WallpaperGrid({ wallpapers }: WallpaperGridProps) {
  const [items, setItems] = useState<Wallpaper[]>(wallpapers)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabaseClient.from("wallpapers").delete().eq("id", id)

      if (error) throw error

      // Update the local state to remove the deleted wallpaper
      setItems(items.filter((item) => item.id !== id))

      toast({
        title: "Wallpaper deleted",
        description: "The wallpaper has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting wallpaper:", error)
      toast({
        title: "Error",
        description: "Failed to delete wallpaper. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (wallpaper: Wallpaper) => {
    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = wallpaper.image_url
    link.download = `${wallpaper.title || "wallpaper"}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your wallpaper is being downloaded.",
    })
  }

  return (
    <Card className="apple-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Wallpapers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((wallpaper) => (
            <div key={wallpaper.id} className="group relative aspect-[16/9] overflow-hidden rounded-lg shadow-sm">
              <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {wallpaper.prompt ? wallpaper.prompt.split(" ").slice(0, 3).join(" ") : "Untitled"}
                </span>
              </div>
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={wallpaper.image_url || "/placeholder.svg"}
                  alt={wallpaper.title || "Wallpaper"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-white font-medium text-xs line-clamp-1">
                  {wallpaper.prompt ? wallpaper.prompt.split(" ").slice(0, 3).join(" ") : "Untitled"}
                </p>
                {wallpaper.prompt && <p className="text-zinc-300 text-xs line-clamp-1">{wallpaper.prompt}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7 rounded-full"
                    onClick={() => handleDownload(wallpaper)}
                  >
                    <Download className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">Download wallpaper</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7 rounded-full"
                    onClick={() => handleDelete(wallpaper.id)}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">Delete wallpaper</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/dashboard/generate"
            className="flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
          >
            <Plus className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">Generate new wallpaper</span>
          </Link>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/dashboard/my-wallpapers" className="w-full">
          <Button variant="outline" className="w-full rounded-full">
            View All Wallpapers
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
