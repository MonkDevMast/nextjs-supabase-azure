"use client"

import { Button } from "@/components/ui/button"
import { Download, Trash2, Filter, Search } from "lucide-react" // Remove Edit from here
import type { Database } from "@/types/supabase"
import { useState } from "react"
import { supabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Wallpaper = Database["public"]["Tables"]["wallpapers"]["Row"]

interface HistoryWallpaperGridProps {
  wallpapers: Wallpaper[]
}

export function HistoryWallpaperGrid({ wallpapers }: HistoryWallpaperGridProps) {
  const [items, setItems] = useState<Wallpaper[]>(wallpapers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStyle, setFilterStyle] = useState<string | null>(null)
  const { toast } = useToast()

  // Get unique styles for filtering
  const styles = Array.from(new Set(wallpapers.map((w) => w.style).filter(Boolean))) as string[]

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
    link.download = `${wallpaper.prompt ? wallpaper.prompt.split(" ").slice(0, 3).join(" ") : "wallpaper"}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your wallpaper is being downloaded.",
    })
  }

  // Filter wallpapers based on search term and style filter
  const filteredWallpapers = items.filter((wallpaper) => {
    const matchesSearch =
      searchTerm === "" ||
      wallpaper.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallpaper.prompt?.toLowerCase().includes(searchTerm.toLowerCase())

    // Show all wallpapers when filterStyle is null (default or "All Styles" selected)
    const matchesStyle = filterStyle === null || wallpaper.style === filterStyle

    return matchesSearch && matchesStyle
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            type="search"
            placeholder="Search wallpapers..."
            className="pl-9 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-zinc-400" />
          <div className="flex flex-col w-full">
            <span className="text-xs text-zinc-400 mb-1">Filter by Style</span>
            <Select
              value={filterStyle || "all"}
              onValueChange={(value) => {
                // Set to null if "all" is selected or empty, otherwise use the value
                setFilterStyle(value === "all" ? null : value)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] rounded-full">
                <SelectValue placeholder="All Styles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                {styles.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredWallpapers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">No wallpapers found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredWallpapers.map((wallpaper) => (
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
                <p className="text-zinc-400 text-xs mt-1">{new Date(wallpaper.created_at).toLocaleDateString()}</p>
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
                  {/* Remove the Edit button and Link that was here */}
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
        </div>
      )}
    </div>
  )
}
