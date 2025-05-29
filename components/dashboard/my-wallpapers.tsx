"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Trash2, Download, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

type Wallpaper = {
  id: string
  title: string
  description: string | null
  image_url: string
  is_public: boolean
  width: number
  height: number
  created_at: string
}

export function MyWallpapers() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchWallpapers = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://etfyosmeksfpskrlilbu.supabase.co"
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseAnonKey) {
          throw new Error("Supabase anon key is missing")
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Fetch user's wallpapers
        const { data, error } = await supabase
          .from("wallpapers")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setWallpapers(data || [])
      } catch (err) {
        console.error("Error fetching wallpapers:", err)
        setError("Failed to load your wallpapers. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWallpapers()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wallpaper?")) {
      return
    }

    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://etfyosmeksfpskrlilbu.supabase.co"
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseAnonKey) {
        throw new Error("Supabase anon key is missing")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Delete wallpaper
      const { error } = await supabase.from("wallpapers").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Update state
      setWallpapers(wallpapers.filter((wp) => wp.id !== id))

      toast({
        title: "Wallpaper deleted",
        description: "Your wallpaper has been deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting wallpaper:", err)
      toast({
        title: "Error deleting wallpaper",
        description: "There was an error deleting your wallpaper. Please try again.",
        variant: "destructive",
      })
    }
  }

  const togglePublic = async (id: string, currentStatus: boolean) => {
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://etfyosmeksfpskrlilbu.supabase.co"
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseAnonKey) {
        throw new Error("Supabase anon key is missing")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Update wallpaper visibility
      const { error } = await supabase
        .from("wallpapers")
        .update({ is_public: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) {
        throw error
      }

      // Update state
      setWallpapers(wallpapers.map((wp) => (wp.id === id ? { ...wp, is_public: !currentStatus } : wp)))

      toast({
        title: `Wallpaper is now ${!currentStatus ? "public" : "private"}`,
        description: `Your wallpaper is now ${!currentStatus ? "visible to everyone" : "only visible to you"}`,
      })
    } catch (err) {
      console.error("Error updating wallpaper visibility:", err)
      toast({
        title: "Error updating wallpaper",
        description: "There was an error updating your wallpaper. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadWallpaper = (url: string, title: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (wallpapers.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">You haven't saved any wallpapers yet.</p>
        <Button onClick={() => (window.location.href = "/dashboard/generate")}>Generate Your First Wallpaper</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wallpapers.map((wallpaper) => (
        <Card key={wallpaper.id} className="overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={wallpaper.image_url || "/placeholder.svg"}
              alt={wallpaper.title}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1 truncate">{wallpaper.title}</h3>
            {wallpaper.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{wallpaper.description}</p>
            )}
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-muted-foreground">{new Date(wallpaper.created_at).toLocaleDateString()}</div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublic(wallpaper.id, wallpaper.is_public)}
                  title={wallpaper.is_public ? "Make private" : "Make public"}
                >
                  {wallpaper.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadWallpaper(wallpaper.image_url, wallpaper.title)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(wallpaper.id)} title="Delete">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
